"use client"

// Registration page with role tabs: Candidate | HR Staff | HR Manager
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RegisterFormCandidate } from '@/components/auth/register-form-candidate'
import { RegisterFormHr } from '@/components/auth/register-form-hr'
import { RegisterFormHrManager } from '@/components/auth/register-form-hr-manager'

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Choose your role to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="candidate">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="candidate">Candidate</TabsTrigger>
            <TabsTrigger value="hr">HR Staff</TabsTrigger>
            <TabsTrigger value="hr-manager">HR Manager</TabsTrigger>
          </TabsList>
          <TabsContent value="candidate">
            <RegisterFormCandidate />
          </TabsContent>
          <TabsContent value="hr">
            <RegisterFormHr />
          </TabsContent>
          <TabsContent value="hr-manager">
            <RegisterFormHrManager />
          </TabsContent>
        </Tabs>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
