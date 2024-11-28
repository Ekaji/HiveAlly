import { LucideIcon } from "lucide-react";

export const CustomButton = ({ onClick, label, icon: Icon }: {
    onClick: () => void, label: string, icon: LucideIcon
}) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-6 py-3 border-4 border-black bg-yellow-300 text-black 
                 text-lg font-extrabold rounded-lg shadow-lg 
                 hover:bg-yellow-400 hover:translate-y-[-2px] active:translate-y-[1px] 
                 transition-all duration-200 cursor-pointer"
    >
      {Icon && <Icon className="h-6 w-6" />}
      {label}
    </div>
  );
};
