import { ChevronDown, ChevronUp} from 'lucide-react';


export default function AccordionSection({ title, icon: Icon, isOpen, onToggle, children, required = false }) {
  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">
            {title} {required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}


