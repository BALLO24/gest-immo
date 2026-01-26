const Footer=()=>{
    return(
        <footer class="bg-gray-900 text-white py-10">
  <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
    
    {/* <!-- Section 1 : À propos --> */}
    <div>
      <h3 class="text-xl font-bold mb-4">À propos de Nous</h3>
      <p class="text-gray-400">
        Nous sommes une entreprise innovante qui valorise la créativité et la qualité. Suivez-nous pour rester à jour avec nos projets.
      </p>
    </div>

    {/* <!-- Section 2 : Liens utiles --> */}
    <div>
      <h3 class="text-xl font-bold mb-4">Liens utiles</h3>
      <ul class="space-y-2">
        <li><a href="#" class="hover:text-yellow-400 transition-colors">Accueil</a></li>
        <li><a href="#" class="hover:text-yellow-400 transition-colors">Services</a></li>
        <li><a href="#" class="hover:text-yellow-400 transition-colors">Blog</a></li>
        <li><a href="#" class="hover:text-yellow-400 transition-colors">Contact</a></li>
      </ul>
    </div>

    {/* <!-- Section 3 : Suivez-nous --> */}
    <div>
      <h3 class="text-xl font-bold mb-4">Suivez-nous</h3>
      <div class="flex space-x-4">
        <a href="#" class="hover:text-blue-500 transition-colors">Facebook</a>
        <a href="#" class="hover:text-cyan-400 transition-colors">Twitter</a>
        <a href="#" class="hover:text-pink-500 transition-colors">Instagram</a>
        <a href="#" class="hover:text-red-600 transition-colors">YouTube</a>
      </div>
    </div>

  </div>

  <div class="mt-10 text-center text-gray-500 text-sm">
    &copy; 2025 Abdoul W. Tous droits réservés.
  </div>
</footer>
    )
}

export default Footer;
