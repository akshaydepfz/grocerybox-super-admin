type FirebaseAuthErrorLike = {
  code: string;
  message?: string;
};

export function firebaseAuthMessage(error: FirebaseAuthErrorLike): string {
  switch (error.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is not enabled for this Firebase project.";
    default:
      return error.message || "Sign-in failed.";
  }
}