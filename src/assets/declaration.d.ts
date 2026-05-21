declare module '*.png' {
    const value: { uri: string }; // This is often the structure of React Native images.
    export default value;
}

declare module '*.jpg' {
    const value: { uri: string };
    export default value;
}
  
declare module '*.svg' {
    const value: { uri: string };
    export default value;
}
  
declare module '*.gif' {
    const value: { uri: string };
    export default value;
}

declare module '*.gif' { // 👈 ADD THIS FOR THE LOADING GIF
  const value: any;
  return value;
}