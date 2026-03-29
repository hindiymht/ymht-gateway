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
    // Create data object
    const data = {
        name,
        mobile,
        location,
        timestamp: new Date().toISOString(),
    };

    // Get existing data from localStorage
    const existingData = localStorage.getItem("formData");

    let formDataArray;

    try {
        // Parse existing data or initialize empty array
        const parsedData = existingData ? JSON.parse(existingData) : [];

        // Ensure parsed data is an array
        formDataArray = Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        // Reset if JSON is invalid
        console.warn("Invalid JSON in localStorage, resetting.");
        formDataArray = [];
    }

    // Push object directly (NOT stringified)
    formDataArray.push(data);

    // Save back as stringified array
    localStorage.setItem("formData", JSON.stringify(formDataArray));
};