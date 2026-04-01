"use client";

import React, {useEffect, useState} from "react";
import {
    Input,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    Spinner
} from "@heroui/react";
import {getDeviceId, getUserLocation, toTitleCase} from "@/lib/utils";
import {siteConfig} from "@/config/site";

// Define the shape of the user data
interface UserProfile {
    name: string;
    mobile: string;
    mhtId: string;
    timestamp: string;
}

export default function AttendanceForm() {
    // Form input states
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [mhtId, setMhtId] = useState("");

    // UI states for loading and view toggling
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'form' | 'list'>('form');

    // State to hold saved users
    const [users, setUsers] = useState<UserProfile[]>([]);

    // Track which user profile is being edited or currently joining
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [joiningIndex, setJoiningIndex] = useState<number | null>(null);

    // Load existing users from local storage when the component mounts
    useEffect(() => {
        // Get stored data
        const storedData = localStorage.getItem("formData");

        if (storedData) {
            try {
                // Parse stored JSON
                const data = JSON.parse(storedData) as UserProfile[];

                // Ensure it's an array and has items
                if (Array.isArray(data) && data.length > 0) {
                    setUsers(data);
                    setView('list');
                }
            } catch (e) {
                // Handle invalid JSON
                console.error("Error parsing local storage", e);
                localStorage.removeItem("formData");
            }
        }
    }, []);

    // Core logic to handle the API submission and local storage updates
    const handleJoin = async (submitName: string, submitMobile: string, submitMhtId: string, isExistingUserClick = false) => {
        setIsLoading(true);

        const formattedName = toTitleCase(submitName);
        const formattedMhtId = submitMhtId.trim().toUpperCase();

        try {
            // Fetch device and location context
            const location = await getUserLocation();
            const deviceId = getDeviceId();

            const updatedUsers = [...users];
            const timestamp = new Date().toISOString();

            // If we are editing an existing profile, update it in place
            if (editIndex !== null) {
                updatedUsers[editIndex] = {
                    ...updatedUsers[editIndex],
                    name: formattedName,
                    mobile: submitMobile,
                    mhtId: formattedMhtId,
                    timestamp: timestamp
                };
                localStorage.setItem("formData", JSON.stringify(updatedUsers));
                setUsers(updatedUsers);
                setEditIndex(null);
            }
            // If submitting a brand new user via the form, add them to the top of the list
            else if (!isExistingUserClick) {
                const alreadyExists = updatedUsers.some(u => toTitleCase(u.name) === formattedName && u.mobile === submitMobile);
                if (!alreadyExists) {
                    updatedUsers.unshift({
                        name: formattedName,
                        mobile: submitMobile,
                        mhtId: formattedMhtId,
                        timestamp: timestamp
                    });
                    localStorage.setItem("formData", JSON.stringify(updatedUsers));
                    setUsers(updatedUsers);
                }
            }

            // Trigger the Google App Script endpoint
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
                        name: formattedName,
                        mhtId: formattedMhtId || null,
                        mobileNo: submitMobile,
                        location: location,
                        deviceId: deviceId,
                        timestamp: timestamp,
                    })
                });
            }

            // Redirect to the Meet link on success
            window.location.assign(siteConfig.link.meet ?? "");
            console.log("Redirecting to the meeting.");

        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to register. Please try again.");
        } finally {
            // Reset loading and active index states regardless of success or failure
            setIsLoading(false);
            setJoiningIndex(null);
        }
    };

    // Form submit handler
    const onSubmitForm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        // Use void to explicitly mark the floating promise as intentionally unawaited
        void handleJoin(name, mobile, mhtId, false);
    };

    // Populate the form fields and switch to form view for editing
    const handleEditUser = (user: UserProfile, index: number) => {
        setName(user.name || "");
        setMobile(user.mobile || "");
        setMhtId(user.mhtId || "");
        setEditIndex(index);
        setView('form');
    };

    // Remove a user from the array and update local storage
    const handleDeleteUser = (index: number) => {
        // Play the delete sound
        if (siteConfig.audio.delete) {
            const audio = new Audio(siteConfig.audio.delete);
            audio.play().catch(err => {
                console.warn("Audio playback blocked:", err);
            });
        }

        const updated = [...users];
        updated.splice(index, 1);
        setUsers(updated);
        localStorage.setItem("formData", JSON.stringify(updated));

        // If no users remain, default back to the form view
        if (updated.length === 0) {
            setView('form');
        }
    };

    return (
        <div className="w-full max-w-md flex flex-col items-center">

            {/* Header section with Title and Subtitle */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                    {siteConfig.text.title}
                </h1>
                <p className="text-red-600 dark:text-red-400 font-bold text-sm tracking-wide uppercase">
                    {siteConfig.text.subtitle}
                </p>
            </div>

            {/* Toggle between Form View and List View */}
            {view === 'form' ? (
                <form onSubmit={onSubmitForm} className="w-full flex flex-col gap-5">
                    {/* Name */}
                    <Input
                        isRequired
                        isClearable
                        type="text"
                        label="Full Name"
                        placeholder="Enter your full name"
                        pattern="^[a-zA-Z\s]{2,}$"
                        value={name}
                        onValueChange={setName}
                        variant="bordered"
                        errorMessage={name.trim().length === 0 ? "Name is required" : "Invalid name"}
                        classNames={{
                            label: "text-default-700 font-medium",
                            inputWrapper: "border-1 border-default-200 shadow-sm",
                        }}
                    />

                    {/* Mobile number */}
                    <Input
                        isRequired
                        isClearable
                        type="tel"
                        label="Mobile Number"
                        placeholder="Enter mobile number"
                        pattern="^[0-9]{10}$"
                        value={mobile}
                        onValueChange={setMobile}
                        variant="bordered"
                        errorMessage={mobile.trim().length === 0 ? "Mobile number is required" : "Invalid mobile number"}
                        classNames={{
                            label: "text-default-700 font-medium",
                            inputWrapper: "border-1 border-default-200 shadow-sm",
                        }}
                    />

                    {/* Mht Id */}
                    <Input
                        isClearable
                        type="text"
                        label="Mht Id"
                        placeholder="Enter Mht Id"
                        pattern="^([Zz][0-9]{3,6}|[0-9]{4,7})$"
                        value={mhtId}
                        onValueChange={setMhtId}
                        variant="bordered"
                        errorMessage={mhtId.trim().length === 0 ? null : "Invalid Mht Id"}
                        classNames={{
                            label: "text-default-700 font-medium",
                            inputWrapper: "border-1 border-default-200 shadow-sm",
                        }}
                    />

                    {/* Submit button */}
                    <Button
                        type="submit"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-[15px] rounded-xl shadow-sm"
                    >
                        {isLoading ? "JOINING..." : (editIndex !== null ? "SAVE & JOIN" : siteConfig.text.cta)}
                    </Button>

                    {/* Quick link back to the list view if users exist in local storage */}
                    {users.length > 0 && (
                        <div className="w-full flex justify-center mt-2">
                            <span
                                onClick={() => {
                                    if (isLoading) return; // Prevent clicking if currently joining
                                    setEditIndex(null);
                                    setView('list');
                                }}
                                className={`font-semibold underline underline-offset-2 transition-colors ${isLoading ? "text-default-400 cursor-not-allowed" : "text-sky-600 dark:text-sky-500 cursor-pointer hover:text-sky-700 dark:hover:text-sky-600"}`}
                            >
                                Existing User?
                            </span>
                        </div>
                    )}
                </form>
            ) : (
                <div className="w-full flex flex-col items-center">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                        JOIN AS
                    </h2>

                    {/* Add pointer-events-none to the wrapper when loading to completely disable clicks on everything inside */}
                    <div
                        className={`w-full bg-orange-50 dark:bg-zinc-900 rounded-2xl p-4 flex flex-col transition-opacity duration-300 ${isLoading ? "pointer-events-none" : ""}`}>
                        {users.map((u, index) => {
                            const isJoiningThis = joiningIndex === index;

                            return (
                                // If we are loading and this is NOT the active row, fade it out to 50% opacity
                                <div
                                    key={index}
                                    className={`flex justify-between items-center border-b border-orange-200 dark:border-zinc-700 py-3 first:pt-1 transition-opacity duration-300 ${isLoading && !isJoiningThis ? "opacity-50" : ""}`}
                                >
                                    <div
                                        className="flex items-center gap-4 cursor-pointer flex-1"
                                        onClick={() => {
                                            setJoiningIndex(index);
                                            // Use void to explicitly mark the floating promise as intentionally unawaited
                                            void handleJoin(u.name, u.mobile, u.mhtId, true);
                                        }}
                                    >
                                        {/* Avatar configuration specifically tailored for male avatars using trait filtering */}
                                        <Avatar
                                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${u.name}&radius=50&backgroundColor=transparent&gestureProbability=0&beardProbability=0&body=variant01,variant03,variant07,variant09,variant10,variant11,variant18&eyes=variant05&hair=hat,variant01,variant05,variant06,variant13,variant17,variant19,variant22,variant34,variant35,variant38,variant54,variant55&lips=variant03,variant14,variant17,variant22,variant23,variant30`}
                                            className="w-12 h-12 border-1 border-white shadow-sm bg-white shrink-0"
                                        />

                                        <div className="flex flex-col">
                                            <span
                                                className="font-bold text-slate-800 dark:text-slate-100">{u.name}</span>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {u.mobile} {u.mhtId ? ` • ID: ${u.mhtId}` : ""}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Conditionally render the Spinner OR the Dropdown for edit/delete actions */}
                                    <div className="flex items-center justify-center w-8">
                                        {isJoiningThis ? (
                                            <Spinner size="sm" color="warning"/>
                                        ) : (
                                            <Dropdown placement="bottom-end">
                                                <DropdownTrigger>
                                                    <Button isIconOnly variant="light"
                                                            className="text-slate-800 dark:text-slate-200 min-w-max w-8">
                                                        <svg fill="currentColor" height="20" viewBox="0 0 24 24"
                                                             width="20" xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"/>
                                                            <path
                                                                d="M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z"/>
                                                            <path
                                                                d="M12 21C13.1046 21 14 20.1046 14 19C14 17.8954 13.1046 17 12 17C10.8954 17 10 17.8954 10 19C10 20.1046 10.8954 21 12 21Z"/>
                                                        </svg>
                                                    </Button>
                                                </DropdownTrigger>

                                                <DropdownMenu aria-label="User Actions">
                                                    {/* Edit option */}
                                                    <DropdownItem key="edit" onClick={() => handleEditUser(u, index)}>
                                                        <span className="flex items-center gap-2">
                                                            <svg fill="none" height="16" viewBox="0 0 24 24" width="16"
                                                                 stroke="currentColor" strokeWidth="2"
                                                                 strokeLinecap="round" strokeLinejoin="round"><path
                                                                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path
                                                                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
                                                        </span>
                                                    </DropdownItem>

                                                    {/* Delete option */}
                                                    <DropdownItem key="delete" className="text-danger" color="danger"
                                                                  onClick={() => handleDeleteUser(index)}>
                                                        <span className="flex items-center gap-2">
                                                            <svg fill="none" height="16" viewBox="0 0 24 24" width="16"
                                                                 stroke="currentColor" strokeWidth="2"
                                                                 strokeLinecap="round" strokeLinejoin="round"><path
                                                                d="M3 6h18"/><path
                                                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
                                                        </span>
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* New User option */}
                        {/* Fade out the "New User" button during loading as well */}
                        <div
                            className={`flex items-center gap-4 py-3 cursor-pointer mt-1 group transition-opacity duration-300 ${isLoading ? "opacity-50" : ""}`}
                            onClick={() => {
                                setEditIndex(null);
                                setName("");
                                setMobile("");
                                setMhtId("");
                                setView('form');
                            }}
                        >
                            {/* Plus Icon */}
                            <div
                                className="w-12 h-12 rounded-full border border-slate-400 flex items-center justify-center shrink-0 group-hover:bg-black/5 dark:group-hover:bg-white/10 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg" className="text-slate-700 dark:text-slate-300">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            <span className="font-bold text-slate-800 dark:text-slate-200">New User</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}