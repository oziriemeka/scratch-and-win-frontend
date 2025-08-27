
export const useImageUrl = () => {

    const getImageUrl = (name: String) => {
      return new URL(`../assets/images/${name}`, import.meta.url).href;
    };
    const getImageUrlSvg = (name: String) => {
      return new URL(`../assets/images/${name}.svg`, import.meta.url).href;
    };
    const getImageUrlGif = (name: String) => {
      return new URL(`../assets/images/${name}.gif`, import.meta.url).href;
    };    
    const getSvgIcon = (name: String) => {
      return new URL(`../assets/images/icons/${name}.svg`, import.meta.url).href;
    };
  
    return {
      getImageUrl,
      getImageUrlSvg,
      getImageUrlGif,
      getSvgIcon
    }
  }