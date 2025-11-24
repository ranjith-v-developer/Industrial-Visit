import dayjs from "dayjs";

export const GROUPS = {
    INSTITUE: "institute",
    INDUSTRY: "industry",
    SUPPORT: "support"
};

export const INSTITUE_NAVIGATIONS = [
    { name: 'Dashboard', path: '/institute/dashboard' },
    { name: 'Industrial Visits', path: '/institute/industrial-visits' },
    { name: 'Applied Industrial Visits', path: '/institute/industrial-visits/applied' },
];

export const DEFAULT_NAVIGATIONS = [];

export const INDUSTRY_NAVIGATIONS = [
    { name: 'Dashboard', path: '/industry/dashboard' },
    { name: 'Industrial Visits', path: '/industry/industrial-visits' },
];

export const DEPARTSMENTS = [
    { label: "Bachelor of Mechanical Engineering", value: "bachelor_mechanical_engineering" },
    { label: "Bachelor of Civil Engineering", value: "bachelor_civil_engineering" },
    { label: "Bachelor of Electrical Engineering", value: "bachelor_electrical_engineering" },
    { label: "Bachelor of Electronics and Communication Engineering", value: "bachelor_electronics_and_communication_engineering" },
    { label: "Bachelor of Electrical and Electronics Engineering", value: "bachelor_electrical_and_electronics_engineering" },
    { label: "Bachelor of Computer Science Engineering", value: "bachelor_computer_science_engineering" },
    { label: "Bachelor of Information Technology", value: "bachelor_information_technology" },
    { label: "Bachelor of Chemical Engineering", value: "bachelor_chemical_engineering" },
    { label: "Bachelor of Aerospace Engineering", value: "bachelor_aerospace_engineering" },
];

export interface dateOptions {
    checkSame?: boolean,
    checkAfter?: boolean,
    checkSameOrAfter?: boolean,
    checkBefore?: boolean,
    checkSameOrBefore?: boolean,
}

export const checkDate = (date: string, obj: dateOptions): boolean => {
    const reversedDate = dayjs(`${date.split('-').reverse().join('-')}`);
    const currentDate = dayjs().startOf('day');
    let checkCondition = false;

    if (obj.checkSame) {
        checkCondition = currentDate.isSame(reversedDate);
    }
    if (obj.checkAfter) {
        checkCondition = currentDate.isAfter(reversedDate);
    }
    if (obj.checkSameOrAfter) {
        checkCondition = currentDate.isSame(reversedDate) || currentDate.isAfter(reversedDate);
    }
    if (obj.checkBefore) {
        checkCondition = currentDate.isBefore(reversedDate);
    }
    if (obj.checkSameOrBefore) {
        checkCondition = currentDate.isSame(reversedDate) || currentDate.isBefore(reversedDate);
    }
    return checkCondition
}

export const getRandomRGBColor = (type = 'normal') => {
    if (type === 'light-dark') {
        const r = Math.floor(Math.random() * 79) + 50; // Random red value between 50 and 128
        const g = Math.floor(Math.random() * 79) + 50; // Random green value between 50 and 128
        const b = Math.floor(Math.random() * 79) + 50; // Random blue value between 50 and 128        
        return `rgb(${r}, ${g}, ${b})`; 
    }
    if (type === 'dark') {
        const r = Math.floor(Math.random() * 81); // Random red value between 0 and 80
        const g = Math.floor(Math.random() * 81); // Random green value between 0 and 80
        const b = Math.floor(Math.random() * 81); // Random blue value between 0 and 80 
        return `rgb(${r}, ${g}, ${b})`; 
    }
    if (type === 'light') {
        const r = Math.floor(Math.random() * 106) + 150; // Random red value between 150 and 255
        const g = Math.floor(Math.random() * 106) + 150; // Random green value between 150 and 255
        const b = Math.floor(Math.random() * 106) + 150; // Random blue value between 150 and 255
        return `rgb(${r}, ${g}, ${b})`;
    }
    const r = Math.floor(Math.random() * 256); // Random red value between 0 and 255
    const g = Math.floor(Math.random() * 256); // Random green value between 0 and 255
    const b = Math.floor(Math.random() * 256); // Random blue value between 0 and 255
    return `rgb(${r}, ${g}, ${b})`;
}

export const downloadBase64CSV = (encodeValue: string, filename: string) => {
    let csvContent = atob(encodeValue);
    let blob = new Blob([csvContent], { type: 'text/csv' });
    var url  = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
  
  