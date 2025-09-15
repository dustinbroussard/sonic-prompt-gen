
import React, { Suspense } from "react";
const SunoPromptEngine = React.lazy(() => import("@/components/SunoPromptEngine"));

const Index = () => (
  <Suspense fallback={<div className="p-6 text-center text-sm text-muted-foreground">Loading prompt engine…</div>}>
    <SunoPromptEngine />
  </Suspense>
);

export default Index;
