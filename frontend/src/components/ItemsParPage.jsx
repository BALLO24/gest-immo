export default function ItemsParPageOptions({value, onChange, options=[10,20,30,50,100],className=''}){
    return(
        <div className={`flex items-center space-x-2  ${className}`}>
            <label htmlFor="itemsPerPage" className="text-sm font-semibold text-gray-600">Affichage par page :</label>
            <select className="bg-gradient-to-l from-blue-600 to-blue-800 shadow-lg font-semibold text-gray-100  pl-3 pr-10 py-1 text-base border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 sm:text-sm rounded-md"
            id="itemsPerPage"
            value={value}
            onChange={(e)=>onChange(Number(e.target.value))}
            
            >
                {
                    options.map((option)=>(
                        <option className="text-black" key={option} value={option}>
                            {option}
                        </option>
                    ))
                }
            </select>
        </div>
    )
}