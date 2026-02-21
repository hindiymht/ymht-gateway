"use client";

import React, {useEffect, useState} from "react";
import {Input, Button, Card, CardBody, CardHeader, CardFooter, Image} from "@heroui/react";
import {getDeviceId, getUserLocation, saveFormData} from "@/lib/utils";
import {siteConfig} from "@/config/site";

export default function AttendanceForm() {
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Load data on mount
    useEffect(() => {
        const storedData = localStorage.getItem("formData");
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                // Check if it's an array and has at least one item
                if (Array.isArray(data) && data.length > 0) {
                    // Get the first item and parse it (since it's stored as stringified JSON)
                    const firstItemData = JSON.parse(data[0]);
                    const storedDate = new Date(firstItemData.timestamp).setHours(0, 0, 0, 0);
                    const today = new Date().setHours(0, 0, 0, 0);
                    if (storedDate === today) {
                        setName(firstItemData.name || "");
                        setMobile(firstItemData.mobile || "");
                    } else {
                        localStorage.removeItem("formData");
                    }
                } else {
                    const storedDate = new Date(data.timestamp).setHours(0, 0, 0, 0);
                    const today = new Date().setHours(0, 0, 0, 0);
                    if (storedDate === today) {
                        setName(data.name || "");
                        setMobile(data.mobile || "");
                    } else {
                        localStorage.removeItem("formData");
                    }
                }
            } catch (e) {
                console.error("Error parsing local storage", e);
                localStorage.removeItem("formData");
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const location = await getUserLocation();
            const deviceId = getDeviceId();

            saveFormData(name, mobile, location);

            const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

            if (scriptUrl) {
                // We use await here to ensure data is sent before redirecting
                await fetch(scriptUrl, {
                    method: "POST",
                    mode: "cors",
                     headers: {
                        'Content-Type': 'text/plain', // Prevents the Preflight/OPTIONS request
                        'Accept': '*/*',
                        'Connection': 'keep-alive',
                    },
                    body: JSON.stringify({
                        name,
                        mobileNo: mobile,
                        location,
                        deviceId,
                        timestamp: new Date().toISOString(),
                    })
                });
            }

            // 2. Redirect to Meet
            window.location.assign(siteConfig.link.meet ?? "");

        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to register. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-100 p-4 shadow-lg min-h-[85vh] md:min-h-0 flex flex-col justify-between">
            <CardHeader className="flex gap-3 px-4 pt-4">
                <Image
                    alt="YMHT Logo"
                    height={24}
                    radius="none"
                    src="/assets/logo.svg"
                    width={24}
                />
                <h4 className="text-lg font-bold text-default-800">{siteConfig.text.name}</h4>
            </CardHeader>

            <CardBody className="overflow-visible py-2">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="w-full aspect-video bg-default-100 rounded-xl overflow-hidden mb-2">
                        <Image
                            alt="Session Banner"
                            className="object-cover w-full h-full"
                            src="/assets/images/img-banner-summer-camp-2024.jpg"
                            radius="lg"
                            width="100%"
                        />
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-default-800 mb-1">{siteConfig.text.title}</h1>
                        <div
                            className="text-red-600 dark:text-red-400 font-semibold text-sm">{siteConfig.text.subtitle}</div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <Input
                            isRequired
                            type="text"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={name}
                            onValueChange={setName}
                            isClearable
                            variant="bordered"
                            autoComplete="name"
                        />

                        <Input
                            isRequired
                            type="tel"
                            label="Mobile Number"
                            placeholder="Enter mobile number"
                            value={mobile}
                            onValueChange={setMobile}
                            isClearable
                            variant="bordered"
                            autoComplete="tel"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                    >
                        {isLoading ? "JOINING..." : siteConfig.text.cta}
                    </Button>
                </form>
            </CardBody>

            <CardFooter className="flex flex-col items-center justify-center pt-2 pb-4">
                <Image
                    alt="GNC Logo"
                    height={48}
                    src="/assets/images/img-gnc-logo.png"
                    width={48}
                    className="mb-2"
                />
                <p className="text-small text-default-500">{siteConfig.text.footer}</p>
            </CardFooter>
        </Card>
    );
}