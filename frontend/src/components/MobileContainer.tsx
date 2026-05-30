import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export const MobileContainer = ({ children }: MobileContainerProps) => {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100">
      <div
        className="relative bg-white shadow-lg overflow-y-auto"
        style={{
          width: "100%",
          maxWidth: "430px", // максимальная ширина как у телефона
          minHeight: "100vh",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }}
      >
        {children}
      </div>
    </div>
  );
};
