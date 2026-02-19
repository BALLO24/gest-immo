import React from 'react';
import { ListOrdered, ChevronDown } from "lucide-react";

export default function ItemsParPageOptions({ value, onChange, options = [10, 20, 30, 50, 100], className = '' }) {
    return (
        <div className={`flex items-center gap-3 bg-gray-50 p-2 px-4 rounded-2xl border border-gray-100 shadow-sm ${className}`}>
            {/* Icône et Label */}
            <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-1.5 rounded-lg">
                    <ListOrdered size={16} className="text-orange-600" />
                </div>
                <label 
                    htmlFor="itemsPerPage" 
                    className="text-[11px] font-black uppercase tracking-tighter text-gray-400"
                >
                    Lignes par page
                </label>
            </div>

            {/* Sélecteur stylisé */}
            <div className="relative flex items-center">
                <select 
                    id="itemsPerPage"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="appearance-none bg-gray-900 text-white font-black text-xs pl-4 pr-10 py-2 rounded-xl focus:ring-2 focus:ring-orange-600 outline-none cursor-pointer transition-all hover:bg-black"
                >
                    {options.map((option) => (
                        <option className="bg-white text-gray-900 font-bold" key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                
                {/* Custom Chevron */}
                <div className="absolute right-3 pointer-events-none text-orange-500">
                    <ChevronDown size={14} strokeWidth={3} />
                </div>
            </div>
        </div>
    );
}