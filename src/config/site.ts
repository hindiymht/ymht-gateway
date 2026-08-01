export const siteConfig = {
    text: {
        name: "MBA Session Gateway",
        description: "Weekly MBA Session Attendance",
        title: "MBA Session",
        subtitle: "EVERY SUNDAY & WEDNESDAY at 9:00 PM",
        cta: "JOIN SESSION",
        footer: "Sheel Sadhak"
    },
    link: {
        script: process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL,
        meet: process.env.NEXT_PUBLIC_MEET_URL,
    },
    image: {
        logo: "/assets/logo.svg",
        banner: "/assets/img-banner.jpg",
        footerLogo: "/assets/mba-logo.svg",
    },
    audio: {
        light: "/assets/audios/switch-off.mp3",
        dark: "/assets/audios/switch-on.mp3",
        delete: "/assets/audios/bin.mp3",
    }
};

export type SiteConfig = typeof siteConfig;
