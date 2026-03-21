import PageTransition from "@/shared/ui/PageTransition";
import TwoStep from "@/shared/ui/twostep";

function App() {
  return (
    <PageTransition>
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <TwoStep />
      </div>
    </PageTransition>
  );
}
export default App;
