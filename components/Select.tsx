
import React from 'react';

interface SelectProps<T extends string> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: T[];
  value: T;
}

const Select = <T extends string,>({ label, options, value, ...props }: SelectProps<T>) => {
  return (
    <div className="w-full">
      <label htmlFor={label} className="block text-sm font-medium text-slate-400">
        {label}
      </label>
      <select
        id={label}
        name={label}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-800 border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={value}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
