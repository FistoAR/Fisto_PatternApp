export const getTextureLibrary = () => {
  // Use Vite's import.meta.glob to dynamically import all texture images
  const textureFiles = import.meta.glob('../assets/images/Editor 1/Texture/**/*.{png,jpg,jpeg,PNG,JPG,JPEG}', { eager: true, query: '?url', import: 'default' });
  
  const library = {};

  for (const path in textureFiles) {
    const url = textureFiles[path];
    
    // Path looks like: ../assets/images/Editor 1/Texture/Wood/corkboard3b/corkboard3b-albedo.png
    const parts = path.split('/');
    if (parts.length < 4) continue;
    
    const fileName = parts.pop(); // corkboard3b-albedo.png
    const textureName = parts.pop(); // corkboard3b
    const categoryName = parts.pop(); // Wood
    
    // Some directories might have .txt or desktop.ini which are ignored by the glob.
    
    if (!library[categoryName]) {
      library[categoryName] = {};
    }
    
    if (!library[categoryName][textureName]) {
      library[categoryName][textureName] = {
        name: textureName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        maps: {}
      };
    }
    
    const lowerFileName = fileName.toLowerCase();
    
    if (lowerFileName.includes('preview')) {
      library[categoryName][textureName].preview = url;
    } else if (lowerFileName.includes('albedo') || lowerFileName.includes('basecolor')) {
      library[categoryName][textureName].maps.albedo = url;
    } else if (lowerFileName.includes('normal')) {
      library[categoryName][textureName].maps.normal = url;
    } else if (lowerFileName.includes('roughness')) {
      library[categoryName][textureName].maps.roughness = url;
    } else if (lowerFileName.includes('metallic') || lowerFileName.includes('metalness') || lowerFileName.includes('metal')) {
      library[categoryName][textureName].maps.metallic = url;
    } else if (lowerFileName.includes('ao')) {
      library[categoryName][textureName].maps.ao = url;
    } else if (lowerFileName.includes('height')) {
      library[categoryName][textureName].maps.height = url;
    }
  }

  // Convert to array format for easy mapping in UI
  const formattedLibrary = Object.keys(library).map(category => ({
    category,
    textures: Object.keys(library[category]).map(key => ({
      id: key,
      ...library[category][key]
    }))
  }));

  return formattedLibrary;
};
