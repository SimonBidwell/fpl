import { useLocation, useRouter } from "wouter";

export const useReplaceNavigate = () => {
    const { base } = useRouter();
    const [, navigate] = useLocation();
    
    return (str: string, replacement: string) => {
        navigate(`~${base.replaceAll(str, replacement)}`)
    }
}