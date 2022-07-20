import React, { useReducer, useCallback, useContext } from "react"
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { SignInResponse, SIGN_IN, SignInRequest } from "../api/SignIn";
import { SignUpResponse, SIGN_UP, SignUpRequest } from "../api/SignUp";
import { setAuthToken, removeAuthToken, getAuthToken } from "../api/AuthToken";
import { useEffectOnlyOnce } from "../hooks/useEffectOnlyOnce";
import { ValidateAuthTokenResponse, ValidateAuthTokenRequest, VALIDATE_AUTH_TOKEN } from "../api/ValidateAuthToken";
import { OnBoardingContext } from "./onboarding/OnBoardingProvider";
import { GetPushNotificationTokenService, NotificationsNotEnabledError } from "../services/notification/GetPushNotificationTokenService";
import { Role } from "../api/types/Role";
import { User } from "../api/types/User";

interface AuthProviderProps {
}

type AuthAction = 
    | { type: "signInRequest", payload: { email: string, password: string, pushNotificationToken?: string } }
    | { type: "authenticationSuccess", payload: { token: string, user: User} }
    | { type: "signInFailed", payload: {error: Error } }
    | { type: "confirmSignInFailed" }
    | { type: "signUpRequest", payload: {email: string, password: string, role: Role } }
    | { type: "signUpFailed", payload: {error: Error } }
    | { type: "confirmSignUpFailed" }
    | { type: "signOut" }
    | { type: "toggleRememberMe" }
    | { type: "restoreTokenComplete", payload: {token?: string | null, rememberToken: boolean, user?: User }};

type AuthState = {
    loadingAuthToken: boolean,
    isSignedIn: boolean
    signingIn: boolean
    signInFailed: boolean,
    rememberMe: boolean,
    signingUp: boolean
    signUpFailed: boolean,
    user?: User,
};

const initialAuthState: AuthState = {
    loadingAuthToken: true,
    isSignedIn: false,
    signingIn: false,
    signInFailed: false,
    rememberMe: false,
    signUpFailed: false,
    signingUp: false,
};

type  AuthReducer = (state: AuthState, action: AuthAction) => AuthState;

type AuthContextType = {authState: AuthState, dispatch: React.Dispatch<AuthAction>};

const pushNotificationTokenService = new GetPushNotificationTokenService();

export const AuthContext = React.createContext<AuthContextType>({authState: initialAuthState, dispatch: () => {}});
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [signIn, signInStatus] = useMutation<SignInResponse, SignInRequest>(SIGN_IN);
    const [signUp, signUpStatus] = useMutation<SignUpResponse, SignUpRequest>(SIGN_UP);
    const [validateAuthToken, validateAuthTokenStatus] = useMutation<ValidateAuthTokenResponse, ValidateAuthTokenRequest>(VALIDATE_AUTH_TOKEN);
    const { hideOnBoarding } = useContext(OnBoardingContext);

    const authReducer = useCallback((state: AuthState, action: AuthAction): AuthState => {
        console.log(action.type);
        switch (action.type) {
            case "signInRequest":
                (async () => {
                    const {email, password} = action.payload;
                    const pushNotificationToken = await pushNotificationTokenService.getPushNotificationToken();
                    try {
                        console.log(JSON.stringify({email, password, pushNotificationToken}));
                        const result = await signIn({variables: {email, password, pushNotificationToken}});
                        console.log(JSON.stringify(result));
                        if(result.data?.signIn.success) {
                            const { token, user } = result.data?.signIn;
                            dispatch({type: "authenticationSuccess", payload: {token: token!, user: user!}})
                        } else {
                            dispatch({type: "signInFailed", payload: {error: new Error("Sign in failed.")}})
                        }
                    } catch (e) {
                        console.log(e);
                        dispatch({type: "signInFailed", payload: {error: new Error("Sign up failed.")}})
                    }
                })();
                return {...state, signingIn: true, signInFailed: false}
            case "authenticationSuccess":
                hideOnBoarding();
                setAuthToken(action.payload.token, state.rememberMe);
                return {...state, signingIn: false, signInFailed: false, isSignedIn: true, user: action.payload.user }
            case "signInFailed":
                return {...state, signingIn: false, signInFailed: true, isSignedIn: false }
            case "confirmSignInFailed":
                return {...state, signInFailed: false}
            case "signUpRequest":
                (async () => {
                    const {email, password, role} = action.payload;
                    try {
                        const result = await signUp({variables: {signUpInput:{email, password, role}}});
                        if(result.data?.signUp.success) {
                            const {token, user} = result.data?.signUp;
                            dispatch({type: "authenticationSuccess", payload: {token: token!, user: user!}})
                        } else {
                            console.log(JSON.stringify(result.errors));
                            dispatch({type: "signUpFailed", payload: {error: new Error("Sign up failed.")}})
                        }
                    } catch (e) {
                        console.log(e);
                        dispatch({type: "signUpFailed", payload: {error: new Error("Sign up failed.")}})
                    }
                })();
                return {...state, signingUp: true, signUpFailed: false}
            case "signUpFailed":
                return {...state, signingUp: false, signUpFailed: true, isSignedIn: false }
            case "confirmSignUpFailed":
                return {...state, signUpFailed: false}
            case "toggleRememberMe":
                return {...state, rememberMe: !state.rememberMe}
            case "signOut":
                    removeAuthToken();
                    return {...initialAuthState, loadingAuthToken: false}
            case "restoreTokenComplete":
                const tokenExists = !!action.payload.token;
                const rememberMe = !!action.payload.rememberToken;
                const user = action.payload.user;
                const isSignedIn = tokenExists && !!user;
                
                console.log(JSON.stringify({tokenExists, rememberMe, user, isSignedIn}));

                return {...state, signingIn: false, signInFailed: false, isSignedIn, rememberMe, loadingAuthToken: false, user }
            default:
                return state;
        }
    }, []);

    const [authState, dispatch] = useReducer<AuthReducer, AuthState>(authReducer, initialAuthState, (state) => state);
 
    useEffectOnlyOnce(() => {
        (async() => {
            let authToken;
            try {
                authToken = await getAuthToken();

                if(authToken?.rememberToken) { 
                    const pushNotificationToken = await pushNotificationTokenService.getPushNotificationToken();
                    const response = await validateAuthToken({
                        variables: {
                            pushNotificationToken
                        }
                    });
                    if(!response.errors) {
                        dispatch({type: "restoreTokenComplete", payload: {
                            token: authToken?.token,
                            rememberToken: authToken?.rememberToken,
                            user: response.data!.validateAuthToken
                        }});
                        return;
                    } else {
                        await removeAuthToken();
                    }
                }
            } catch(e) {
                console.log("error loading token ", e);
            }

            dispatch({type: "restoreTokenComplete", payload: {rememberToken: false}});
            
        })();
    })
    return (
            <AuthContext.Provider value={{authState, dispatch}}>
                {children}
            </AuthContext.Provider>
    )
}