"use client"

import { useEffect, useState } from "react"
import { DatabaseService } from "@/lib/database.service"
import { testSupabaseConnection } from "@/lib/test-supabase"

export default function TestDatabasePage() {
  const [testResult, setTestResult] = useState<string>("")
  const [isTesting, setIsTesting] = useState(false)

  const runTest = async () => {
    setIsTesting(true)
    setTestResult("Testing database connection...")

    try {
      // Test Supabase connection
      const supabaseResult = await testSupabaseConnection()
      
      if (supabaseResult) {
        setTestResult(prev => prev + "\n✅ Supabase connection successful!")
        
        // Test creating a contact with social media fields
        const testContact = {
          userId: "test-user-id",
          ism: "Test User",
          raqami: "+998901234567",
          qayerdaTanishilgan: "Test Location",
          qandayFoydasi: "Test Benefit",
          bizningSFoydamiz: "Test Value",
          telegram: "@testuser",
          instagram: "@testinstagram",
          email: "test@example.com"
        }
        
        const createdContact = await DatabaseService.createContact(testContact)
        if (createdContact) {
          setTestResult(prev => prev + "\n✅ Contact creation with social media fields successful!")
          
          // Verify social media fields are saved
          if (createdContact.telegram === "@testuser" && 
              createdContact.instagram === "@testinstagram" && 
              createdContact.email === "test@example.com") {
            setTestResult(prev => prev + "\n✅ Social media fields correctly saved!")
          } else {
            setTestResult(prev => prev + "\n❌ Social media fields not saved correctly!")
          }
          
          // Test fetching contacts
          const contacts = await DatabaseService.getContacts("test-user-id")
          setTestResult(prev => prev + `\n✅ Fetched ${contacts.length} contacts!`)
          
          // Test search functionality with social media fields
          const searchResults = await DatabaseService.searchContacts("test-user-id", "testuser")
          if (searchResults.length > 0) {
            setTestResult(prev => prev + "\n✅ Search by social media field successful!")
          } else {
            setTestResult(prev => prev + "\n❌ Search by social media field failed!")
          }
          
          // Clean up - delete the test contact
          if (createdContact.id) {
            await DatabaseService.deleteContact(createdContact.id, "test-user-id")
            setTestResult(prev => prev + "\n✅ Test contact cleaned up!")
          }
        } else {
          setTestResult(prev => prev + "\n❌ Contact creation failed!")
        }
      } else {
        setTestResult(prev => prev + "\n❌ Supabase connection failed! Using localStorage fallback.")
      }
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Test failed with error: ${error.message || error}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Database Integration Test</h1>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            This page tests the database integration with Supabase and fallback to localStorage.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <pre className="whitespace-pre-wrap text-sm">
              {testResult || "Click the button below to run the test."}
            </pre>
          </div>
          
          <button
            onClick={runTest}
            disabled={isTesting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isTesting ? "Testing..." : "Run Database Test"}
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <h2 className="font-bold mb-2">What this test does:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tests Supabase connection</li>
            <li>Creates a test contact with social media fields</li>
            <li>Verifies social media fields are saved correctly</li>
            <li>Fetches contacts</li>
            <li>Searches by social media field</li>
            <li>Cleans up test data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}