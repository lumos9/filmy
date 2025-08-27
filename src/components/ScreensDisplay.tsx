import { ScreensService } from "@/lib/screens.service";
import ScreensTable from "./ScreensTable";
import LoadingSpinner from "./LoadingSpinner";

export default async function ScreensDisplay() {
  try {
    const { screens, totalCount } = await ScreensService.getAllScreens(1, 100);

    if (screens.length === 0) {
      return (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Screen Database
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your screen database is empty. Add some screens to get started!
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              No Screens Found
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Please add some screens to your database to see them displayed
              here.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Screen Database
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Showing {screens.length} of {totalCount} screens
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <ScreensTable screens={screens} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching screens:", error);
    throw new Error("Failed to load screen data");
  }
}
