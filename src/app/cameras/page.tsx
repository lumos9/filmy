import Cameras from "@/components/Cameras";

export default function CamerasPage() {
  return (
    <div className="md:container mx-auto p-4 max-w-md flex flex-col items-center gap-2 md:gap-4">
      {/* Heading */}
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-3xl font-bold">Cameras</h1>
        <div className="text-center text-muted-foreground text-sm md:text-base">
          Explore different cameras and their specifications used in film
          production.
        </div>
      </div>
      <Cameras />
    </div>
  );
}
