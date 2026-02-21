export const getDeviceId = (): string => {
    if (typeof window === "undefined") return "";

    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
};

export const getUserLocation = async (): Promise<string> => {
    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.city && data.region && data.country_name) {
            return `${data.city}, ${data.region}, ${data.country_name}`;
        }
        return "Location not available";
    } catch (error) {
        console.error("Error getting location:", error);
        return "Location not available";
    }
};

export const saveFormData = (name: string, mobile: string, location: string) => {
    const data = {
        name,
        mobile,
        location,
        timestamp: new Date().toISOString(),
    };
                                                                                         
    // 1. Fetch the raw data
    const existingData = localStorage.getItem("formData");

    let formDataArray;

    try {
        // 2. Parse the data
        const parsedData = existingData ? JSON.parse(existingData) : [];

        // 3. Check if the parsed result is actually an array
        // If it's an object or a single string, we wrap it in an array or reset it
        formDataArray = Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        // 4. If JSON.parse fails (invalid format), initialize a fresh array
        console.warn("localStorage contained invalid JSON, resetting to empty array.");
        formDataArray = [];
    }

    // 5. Add new data (tip: usually better to store objects, not stringified strings)
    formDataArray.push(JSON.stringify(data)); 

    // 6. Save back to localStorage
    localStorage.setItem("formData", JSON.stringify(formDataArray));
};