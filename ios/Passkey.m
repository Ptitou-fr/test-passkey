#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Passkey, NSObject)

RCT_EXTERN_METHOD( signUp: (NSString)domain
                   withDisplayName:(NSString) displayName
                   withUserId:(NSString) userId
                   withChallengeB64: (NSString)challengeB64
                   withSecurityKey: (BOOL) securityKey
                   withResolver: (RCTPromiseResolveBlock)resolve
                   withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD( signIn: (NSString)domain
                   withChallengeB64: (NSString)challengeB64
                   withAllowSavedPassword: (BOOL)allowSavedPassword
                   withPreferLocallyAvailableCredentials: (BOOL)preferLocallyAvailableCredentials
                   withSecurityKey: (BOOL) securityKey
                   withResolver: (RCTPromiseResolveBlock)resolve
                   withRejecter: (RCTPromiseRejectBlock)reject
)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
