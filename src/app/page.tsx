import Image from "next/image";
import AttendanceForm from "@/components/AttendanceForm";

export default function Home() {
    return (
        <div
            className="w-full max-w-7xl mx-auto lg:max-w-full flex-1 flex flex-col lg:flex-row items-center justify-center px-4 lg:px-0 gap-8 lg:gap-0 pb-8 lg:pb-0">

            {/* Left Area: Hero Image */}
            <div
                className="w-full lg:w-1/2 aspect-video rounded-2xl lg:rounded-none lg:rounded-r-4xl overflow-hidden relative shadow-sm order-1 lg:order-0">

                <Image
                    src="/assets/images/MBA-SHEEL.jpg"
                    alt="Session Banner"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
            </div>

            {/* Right Area: Form / User List */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-0 lg:p-8 order-2 lg:order-0">
                <AttendanceForm/>
            </div>
        </div>
    );
}
