import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface AdvancedFilterDropdownProps {
  title: string;
  description?: string;
  options: Option[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

const AdvancedFilterDropdown: React.FC<AdvancedFilterDropdownProps> = ({
  title,
  description,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  multiple = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newSelection = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([optionValue]);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="text-gray-700">{getDisplayText()}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={`filter-${title}`}
                  value={option.value}
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleOptionClick(option.value)}
                  className="mr-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          {multiple && selectedValues.length > 0 && (
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-600">{selectedValues.length} selected</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => onSelectionChange([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterDropdown;