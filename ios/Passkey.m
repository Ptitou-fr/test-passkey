#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Passkey, NSObject)

RCT_EXTERN_METHOD( signUp: (NSString)domain
                   withChallengeB64: (NSString)challengeB64
                   withDisplayName: (NSString)displayName
                   withUserId: (NSString)userId
                   withOptions: (NSDictionary _Nullable)options
                   withResolver: (RCTPromiseResolveBlock)resolve
                   withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD( signIn: (NSString)domain
                   withChallengeB64: (NSString)challengeB64
                   withOptions: (NSDictionary _Nullable)options
                   withResolver: (RCTPromiseResolveBlock)resolve
                   withRejecter: (RCTPromiseRejectBlock)reject
)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
