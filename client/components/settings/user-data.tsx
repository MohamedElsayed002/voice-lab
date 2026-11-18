"use client"

import { useAuthStore } from "@/store/auth.store"
import { Button } from "../ui/button"
import Link from "next/link"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"

import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { Input } from "../ui/input"

export const UserData = () => {
    const user = useAuthStore((state) => state.user)

    return (
        <div className="my-8 w-full divide-y divide-border last:border-b-0 border-y border-border">
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">E-Mail Address</h2>
                    <p className="text-sm text-muted-foreground">
                        {user?.email ?? "Not available"}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">Given Name</h2>
                    <p className="text-sm text-muted-foreground">
                        {user?.name ?? "Not available"}
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button className="shrink-0" variant="outline">
                                Update Given Name
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Given Name</DialogTitle>
                            <DialogDescription>
                                Update the given name associated with your account.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold">Current Plan</h2>
                    <p className="text-sm text-muted-foreground">Free</p>
                </div>
                <Button
                    className="shrink-0"
                    render={<Link href="/subscription" />}
                    variant="outline"
                >
                    Manage Subscription
                </Button>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
                <div className="space-y-1">
                    <h2 className='text-sm font-bold text-red-500'>
                        Delete Entire Account
                    </h2>
                    <p>
                        Permanently delete your entire account across all workspaces. You will no longer be able to create an ElevenLabs account with this email. If you only want to leave a workspace, go to the My Workspaces tab.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button className="border border-red-400 text-red-400 hover:opacity-70" variant="ghost">
                                Delete Account
                            </Button>
                        }
                    />
                    <DialogContent className="min-w-md">
                        <DialogHeader>
                            <DialogTitle>Do you really want to delete your entire account?</DialogTitle>
                            <DialogDescription>
                                <Alert className="text-red-500 border border-red-500">
                                    <InfoIcon />
                                    <AlertTitle>Warning: This will delete your entire account</AlertTitle>
                                    <AlertDescription className="text-red-500/80">
                                        This will permanently delete your account across all workspaces. You will no longer be able to create an account with this email.
                                    </AlertDescription>
                                </Alert>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <h1>Please confirm the deletion of your account by typing in email address below</h1>
                            <Input className='' placeholder="Your email address"/>
                        </div>
                        <DialogFooter>
                            <DialogClose>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button className="border border-red-500 text-red-500 hover:opacity-70" variant="ghost">Delete Account</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}