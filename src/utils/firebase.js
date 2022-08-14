import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

export const fire = firebase.apps[0] ?? firebase.initializeApp({  //se non esiste già un'istanza di firebase la inizializzo
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
});

export const db = fire.firestore();
export const storage = fire.storage();
