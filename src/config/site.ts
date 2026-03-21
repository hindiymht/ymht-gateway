export const siteConfig = {
    text: {
        name: "YMHT Gateway",
        description: "Weekly YMHT Session Attendance",
        title: "Weekly YMHT Session",
        subtitle: "EVERY SUNDAY 7 - 8:30 PM",
        cta: "JOIN SESSION",
        footer: "YMHT Digital Hindi - Boys"
    },
    link: {
        script: process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL,
        meet: process.env.NEXT_PUBLIC_MEET_URL,
    },
    image: {
        logo: "/assets/logo.svg",
        banner: "/assets/img-banner.jpg",
        footerLogo: "/assets/img-gnc-logo.png",
    },
    audio: {
        light: "/assets/audios/switch-off.mp3",
        dark: "/assets/audios/switch-on.mp3",
         delete: "/assets/audios/bin.mp3",
    }
};

export type SiteConfig = typeof siteConfig;