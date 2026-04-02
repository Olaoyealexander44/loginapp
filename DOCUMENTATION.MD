# Login Implementation Documentation

This document outlines the step-by-step implementation of the login functionality using **Custom Hooks** and **TanStack Query** (React Query) in the `loginapp`.

---

## **1. API Layer Configuration**
First, we define the asynchronous function that communicates with the backend. We use `axios` for HTTP requests.

- **File**: `api/authApi.ts`
- **Purpose**: Decouple the network logic from the UI components.
- **Key Function**: `loginUser` takes `username` and `password` and returns the response data (token, user info).

```typescript
export const loginUser = async (data: { username: string; password: string }) => {
  const response = await callApi.post('/auth/login', data); 
  return response.data;
};
```

---

## **2. The Custom Hook: `useLogin`**
We wrap the TanStack Query `useMutation` hook into a custom hook. This encapsulates the side effects of logging in.

- **File**: `hook/useLogin.ts`
- **Key Features**:
  - **`useMutation`**: Manages the state of the POST request (loading, error, success).
  - **`onSuccess`**: 
    - Saves the authentication token to `AsyncStorage` for persistence.
    - Invalidates the `currentUser` query to ensure the app fetches the latest user data.
    - Uses `expo-router` to redirect the user to the main app dashboard `/(tabs)`.
  - **`onError`**: Logs the error for debugging.

```typescript
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('token', data.token);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      router.replace('/(tabs)');
    },
  });
};
```

---

## **3. The UI Components**

### **A. LoginForm (Presentational)**
- **File**: `component/LoginForm.tsx`
- **Role**: A "dumb" component that handles local form state (`username`, `password`) and UI feedback (loading state on the button).
- **Communication**: It receives `onSubmit` and `isLoading` as props from its parent.

### **B. LoginScreen (Container)**
- **File**: `screen/LoginScreen.tsx`
- **Role**: Connects the custom hook to the UI.
- **Logic**:
  - It calls `useLogin()` to get the `mutate` function, `isPending` status, and `error` object.
  - It passes `mutate` to the `LoginForm`'s `onSubmit` prop.
  - It conditionally renders an error message if the login fails.

```tsx
const LoginScreen = () => {
  const { mutate, isPending, error } = useLogin();

  return (
    <LoginForm
      onSubmit={(data) => mutate(data)}
      isLoading={isPending}
    />
    // ... error handling UI
  );
};
```

---

## **Summary of Benefits**
1.  **Separation of Concerns**: API logic is in `authApi.ts`, state logic is in `useLogin.ts`, and UI is in components.
2.  **Automatic State Management**: TanStack Query handles the `isPending` (loading) and `error` states automatically.
3.  **Global Cache Sync**: `queryClient.invalidateQueries` ensures that other parts of the app know the user is now authenticated.
4.  **Reusability**: The `useLogin` hook can be reused in any part of the app if needed (e.g., a "re-authenticate" modal).