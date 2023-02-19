import Foundation
import AuthenticationServices
import os

@available(iOS 16.0, *)
@objc(Passkey)
class Passkey: NSObject, ASAuthorizationControllerPresentationContextProviding, ASAuthorizationControllerDelegate {
    var didCompleteWithAuthorization: (NSDictionary) -> Void = { authorization in }
    var didCompleteWithError: (Error) -> Void = { error in }
    
    @objc
    func signUp(
        _ domain: String,
        withDisplayName displayName: String,
        withUserId userId: String,
        withChallengeB64 challengeB64: String,
        withSecurityKey securityKey: Bool,
        withResolver resolve: @escaping RCTPromiseResolveBlock,
        withRejecter reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        guard let challengeData: Data = Data(base64Encoded: challengeB64) else {
            reject("401", "Invalid challenge", nil);
            return;
        }
        guard let userIdData: Data = userId.data(using: .utf8) else {
            reject("401", "Invalid userId", nil);
            return;
        }
        
        let publicKeyCredentialProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: domain)
        let registrationRequest = publicKeyCredentialProvider.createCredentialRegistrationRequest(challenge: challengeData,
                                                                                                  name: displayName, userID: userIdData)
        let authController = ASAuthorizationController(authorizationRequests: [ registrationRequest ] )
        authController.delegate = self
        authController.presentationContextProvider = self
        authController.performRequests()
        
        didCompleteWithAuthorization = {authorization in
            resolve(authorization);
        }
        didCompleteWithError = { error in
            reject(String((error as NSError).code), String((error as NSError).localizedDescription), nil);
        }
    }
    
    @objc
    func signIn(
        _ domain: String,
        withChallengeB64 challengeB64: String,
        withAllowSavedPassword allowSavedPassword: Bool,
        withPreferLocallyAvailableCredentials preferLocallyAvailableCredentials: Bool,
        withSecurityKey securityKey: Bool,
        withResolver resolve: @escaping RCTPromiseResolveBlock,
        withRejecter reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        // Convert challenge from NSString to Data
        // The challenge needs to be unique for each request.
        guard let challengeData: Data = Data(base64Encoded: challengeB64) else {
            reject("400", "The operation couldn’t be completed. (The challenge provided was invalid)", nil);
            return;
        }
        //         let bytes = [UInt32](repeating: 0, count: 32).map { _ in arc4random() }
        //         let challengeData = Data(bytes: bytes, count: 32)
        
        let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: domain)
        
        // assertion
        let assertionRequest = platformProvider.createCredentialAssertionRequest(challenge: challengeData)
        
        // password
        let passwordCredentialProvider = ASAuthorizationPasswordProvider()
        let passwordRequest = passwordCredentialProvider.createRequest()
        
        
        let authController = ASAuthorizationController(authorizationRequests: [assertionRequest, allowSavedPassword ? passwordRequest : nil].compactMap {$0})
        authController.delegate = self
        authController.presentationContextProvider = self
        if preferLocallyAvailableCredentials {
            authController.performRequests(options: .preferImmediatelyAvailableCredentials)
        } else {
            authController.performRequests()
        }
        
        didCompleteWithAuthorization = {authorization in
            resolve(authorization);
        }
        didCompleteWithError = { error in
            reject(String((error as NSError).code), String((error as NSError).localizedDescription), nil);
        }
    }
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return ASPresentationAnchor()
    }
    
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        let logger = Logger()
        switch authorization.credential {
        case let credentialRegistration as ASAuthorizationPlatformPublicKeyCredentialRegistration:
            // registration result
            didCompleteWithAuthorization(
                [
                    "credentialID": credentialRegistration.credentialID.base64EncodedString(),
                    "attestation": credentialRegistration.rawAttestationObject?.base64EncodedString() ?? "",
                    "clientData": credentialRegistration.rawClientDataJSON.base64EncodedString()
                ]
            )
            logger.log("A new passkey was registered: \(credentialRegistration)")
            // Verify the attestationObject and clientDataJSON with your service.
            // The attestationObject contains the user's new public key to store and use for subsequent sign-ins.
            // let attestationObject = credentialRegistration.rawAttestationObject
            // let clientDataJSON = credentialRegistration.rawClientDataJSON
            
            // After the server verifies the registration and creates the user account, sign in the user with the new account.
            
        case let credentialAssertion as ASAuthorizationPlatformPublicKeyCredentialAssertion:
            // assertion result
            didCompleteWithAuthorization(
                [
                    "signedInWith": "passkey",
                    "credentialID": credentialAssertion.credentialID.base64EncodedString(),
                    "authenticator": credentialAssertion.rawAuthenticatorData.base64EncodedString(),
                    "clientData": credentialAssertion.rawClientDataJSON.base64EncodedString(),
                    "signature": credentialAssertion.signature.base64EncodedString(),
                    "userId": credentialAssertion.userID.base64EncodedString()
                ]
            )
            logger.log("A passkey was used to sign in: \(credentialAssertion)")
            // Verify the below signature and clientDataJSON with your service for the given userID.
            // let signature = credentialAssertion.signature
            // let clientDataJSON = credentialAssertion.rawClientDataJSON
            // let userID = credentialAssertion.userID
            
            // After the server verifies the assertion, sign in the user.
            
        case let passwordCredential as ASPasswordCredential:
            // password result
            didCompleteWithAuthorization(
                [
                    "signedInWith": "password",
                    "user": passwordCredential.user,
                    "password": passwordCredential.password
                ]
            )
            logger.log("A password was provided: \(passwordCredential)")
            // Verify the userName and password with your service.
            // let userName = passwordCredential.user
            // let password = passwordCredential.password
            
            // After the server verifies the userName and password, sign in the user.
            
        default:
            didCompleteWithError("Resolve with an unknown authorization type" as! Error)
            logger.log("Unknown authorization type")
        }
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        didCompleteWithError(error);
    }
}
