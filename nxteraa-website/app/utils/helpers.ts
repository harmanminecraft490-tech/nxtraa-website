export const formatDate = (
    date: Date,
    locale: string = "en-US"
  ): string => {
    return new Intl.DateTimeFormat(locale).format(date);
  };
  
  export const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  export async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  
    return (await response.json()) as T;
  }