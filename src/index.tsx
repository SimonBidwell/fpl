import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "react-query";
import "./index.css";
import { League } from "./components/League";
import { Router, Route, Switch, Redirect } from "wouter";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <NextUIProvider>
                <main className="max-w-screen overflow-x-hidden flex min-h-screen justify-center p-2 bg-zinc-50">
                    <div className="flex flex-col w-full md:w-4/5">
                        <Router base={import.meta.env.BASE_URL}>
                            <Switch>
                                <Route path="/league/1/" nest>
                                    <League />
                                </Route>
                                <Route path="/404">My very own 404</Route>
                                <Route>
                                    <Redirect to="/league/1/" />
                                </Route>
                            </Switch>
                        </Router>
                    </div>
                </main>
            </NextUIProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
