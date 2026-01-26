export default function SearchBar({value,onChange,className}){
    return(
        <>
            <div className={`m-4 max-w-md min-w-[200px] ${className}`}>
                <div className="relative">
                    <input
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-blue-500 focus:border-blue-800 focus:ring-blue-800 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none hover:border-blue-600 shadow-sm focus:shadow"
                    placeholder="Rechercher..." 
                    value={value}
                    onChange={(e)=>onChange(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2 text-black absolute top-2 right-1 rounded ">
                        <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </>
    )
}