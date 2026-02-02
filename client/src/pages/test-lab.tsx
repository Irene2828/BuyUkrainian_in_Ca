import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Search, Map, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function TestLab() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F9F9F7] p-12 font-sans text-slate-900">
            <Link href="/">
                <button className="mb-12 flex items-center gap-2 text-slate-500 hover:text-black transition-colors outline-none cursor-pointer">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </button>
            </Link>

            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">The "No-Border" Test Lab</h1>
                <p className="text-slate-500 mb-16 text-lg">
                    Verifying that the nuclear CSS reset has successfully exterminated all default black borders and focus rings.
                </p>

                <div className="grid gap-16">

                    {/* TEST 1: The Raw HTML Button */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">1. The "Raw" HTML Button</h2>
                        <p className="text-sm text-slate-500">
                            This is a naked &lt;button&gt; tag. It should have NO border, NO background, and NO focus ring click.
                        </p>
                        <div className="p-8 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                            <button onClick={() => alert('Clicked!')}>
                                I am a raw button (Click me)
                            </button>
                        </div>
                    </section>

                    {/* TEST 2: The "Premium Action" (Pill) */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">2. The "Premium Action" Pill</h2>
                        <p className="text-sm text-slate-500">
                            Solid black. Hover lifts. Focus should be a soft blue halo, NOT a black ring.
                        </p>
                        <div className="p-8 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                            <button className="btn-premium-action">
                                Start Contributing
                            </button>
                        </div>
                    </section>

                    {/* TEST 3: The "Monochrome Link" (Header Style) */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">3. The "Monochrome Link"</h2>
                        <p className="text-sm text-slate-500">
                            Text only. No container. Black underline expands from center on hover.
                        </p>
                        <div className="p-8 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center gap-8">
                            <button className="text-[16px] font-medium text-[#4B5563] relative group transition-transform duration-200 hover:text-[#111827] hover:scale-[1.02] outline-none">
                                Add a Store
                                <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                            </button>
                        </div>
                    </section>

                    {/* TEST 4: The Dialog Trigger (Data-State) */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">4. The Dialog Trigger (Data-State)</h2>
                        <p className="text-sm text-slate-500">
                            Radix UI often forces borders on data-state='open'. The nuclear fix should prevent this.
                        </p>
                        <div className="p-8 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="btn-premium-action bg-blue-600 hover:bg-blue-700 text-white">
                                        Open Dialog
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <div className="p-6 text-center">
                                        <h3 className="text-lg font-bold mb-2">It Works!</h3>
                                        <button onClick={() => setDialogOpen(false)} className="underline text-slate-500">Close</button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </section>

                    {/* TEST 5: The Icon Button */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">5. The Icon Button</h2>
                        <p className="text-sm text-slate-500">
                            Should settle perfectly without any square border artifacts.
                        </p>
                        <div className="p-8 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center gap-4">
                            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors text-blue-600">
                                <Map className="w-5 h-5" />
                            </button>
                            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors text-slate-400">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
