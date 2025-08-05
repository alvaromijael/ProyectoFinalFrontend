// import { createUserWithEmailAndPassword, getAdditionalUserInfo, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
// import { auth, db } from "../../firebase/firebase";
// import type { AppUser } from "../interfaces/AppUser";
// import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// export const registerUser = async (
//   email: string,
//   password: string,
//   firstName: string,
//   lastName: string,
//   role:"admin" |"user"|"superadmin"="user"
// ) => {
//   const userCredential = await createUserWithEmailAndPassword(
//     auth,
//     email,
//     password
//   );

//   const { uid } = userCredential.user;
//   const newUser: AppUser = { uid, email, firstName, lastName,role };
//   await setDoc(doc(db,'users',uid), newUser);

//   return newUser;
// };

// export const loginUser = async(email: string, password: string) => {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const uid = userCredential.user.uid;

//     const userDoc = await getDoc(doc(db, 'users', uid));

//     if(userDoc.exists()){
//         return userDoc.data() as AppUser;
//     }

//     return null;

// }

// export const logoutUser = async() : Promise<void> =>{
//   await signOut(auth);
// }

// export const getCurrentUserData = async (uid: string) : Promise<AppUser | null > => {

//   const userDoc = await getDoc(doc(db, 'users', uid));
  
//   if(userDoc.exists()){
//     return userDoc.data() as AppUser;
//   }
//   return null;
// }

// export const loginWithGoogle = async():  Promise<AppUser> =>{

//   const provider = new GoogleAuthProvider();
//   const result = await signInWithPopup(auth, provider);

//   console.log("El resultado es: ", result);

//   const { user } = result;

//   const userInfo = getAdditionalUserInfo(result);
//   const isNewUser = userInfo?.isNewUser

//   const userData: AppUser = {
//     uid: user.uid, 
//     email:user.email ?? '', 
//     firstName: user.displayName?.split(' ')[0] ?? '', 
//     lastName:user.displayName?.split(' ')[1] ?? '', 
//     role:'user',
//   }


//   if(isNewUser){
//     //registrar un nuevo usuario
//     await setDoc(doc(db,'users',user.uid), userData);
//   }

//   return userData;
// }

// export const updateUserData = async (user: AppUser): Promise<void> => {
//   const userRef = doc(db, "users", user.uid);
//   await updateDoc(userRef, {
//     firstName: user.firstName,
//     lastName: user.lastName,
//     role: user.role,
//   });
// };

import axios from "axios";
import type { AppUser } from "../interfaces/AppUser";


interface AuthResponse {
  user: AppUser;
  token: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await axios.post("http://127.0.0.1:8000/auth/login", { email, password });
  return response.data;
};

export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "admin" | "user" | "superadmin"
): Promise<AuthResponse> => {
  const response = await axios.post("http://127.0.0.1:8000/auth/register", {
    email,
    password,
    firstName,
    lastName,
    role,
  });
  return response.data;
};

export const loginWithGoogle = async (): Promise<AuthResponse> => {
  const response = await axios.get("/api/auth/google");
  return response.data;
};