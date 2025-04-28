// Spinner.js
export function Spinner({ size = "sm" }) {
    const spinnerSize = size === "lg" ? "w-12 h-12" : "w-6 h-6"; // Determine the size based on the prop
  
    return (
      <div
        className={`border-t-4 border-blue-500 border-solid rounded-full animate-spin ${spinnerSize}`}
        style={{
          borderTopColor: "transparent",
        }}
      />
    );
  }
  