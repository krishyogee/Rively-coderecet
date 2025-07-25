'use client'

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Building2, User, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_CUSTOMER } from '@/graphql/customer/queries';
import { UPDATE_CUSTOMER_AND_USER, UpdateCustomerAndUserInput } from '@/graphql/customer/mutations';
import { toast } from '@/hooks/use-toast';

interface Brand {
  domain: string;
  icon: string;
  name: string;
}

export default function CreateAccount() {
  const router = useRouter();
  const client = useApolloClient(); // Get Apollo Client instance
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Brand[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Brand | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false); // Manage loading state manually
  const [error, setError] = useState<string | null>(null); // Manage error state
  const clientId = '1idyJSKpER3b8yHqXHV';

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);
    setError(null); // Clear previous errors

    if (query.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${clientId}`
        );
        const data = await response.json();
        setResults(data);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    } else {
      setResults([]);
      setLoading(false);
    }
  };

  const handleSelectCompany = (brand: Brand) => {
    setSelectedCompany(brand);
    setSearchQuery(brand.domain);
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 2 && results.length > 0) {
      setShowResults(true);
    }
  };
 
  const handleContinue = async () => {
    if (!selectedCompany || !name || !role) {
      toast({
        title: 'Missing information',
        description: 'Please fill all fields',
        duration: 5000,
        variant: 'destructive',
      });
      setError('Please fill all fields');
      return;
    }

    const input: UpdateCustomerAndUserInput = {
      domain: selectedCompany.domain,
      name: name,
      role: role,
    };

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const { data } = await client.mutate({
        mutation: UPDATE_CUSTOMER_AND_USER,
        variables: { input }, // Ensure fresh data
        refetchQueries: [{ query: GET_CUSTOMER }], // Refetch queries after mutation
      });

      toast({
        title: 'Account updated successfully',
        description: 'Your account information has been saved.',
        variant: 'default',
      });
      setLoading(false);
      router.push('/onboarding/choose-companies');  
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Error updating account',
        description: error.message,
        duration: 5000,
        variant: 'destructive',
      });
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#040924]">
            Welcome to Rively
          </CardTitle>
          <CardDescription className="text-center text-[#040924]/80">
            Let's complete your account setup
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-[#040924]" htmlFor="Name">
              Enter your name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="Name" 
                placeholder="John" 
                className="pl-10 text-[#040924] border-[#040924]/20 focus:border-[#040924]/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-[#040924]" htmlFor="role">
              Choose your role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Select onValueChange={(value) => setRole(value)}>
                <SelectTrigger 
                  id="role" 
                  className="pl-10 text-[#040924] border-[#040924]/20 focus:border-[#040924]/50"
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto text-[#040924]">
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="co-founder">Co-Founder</SelectItem>
                  <SelectItem value="ceo">Chief Executive Officer (CEO)</SelectItem>
                  <SelectItem value="coo">Chief Operating Officer (COO)</SelectItem>
                  <SelectItem value="cto">Chief Technology Officer (CTO)</SelectItem>
                  <SelectItem value="cfo">Chief Financial Officer (CFO)</SelectItem>
                  <SelectItem value="cmo">Chief Marketing Officer (CMO)</SelectItem>
                  <SelectItem value="cio">Chief Information Officer (CIO)</SelectItem>
                  <SelectItem value="chro">Chief Human Resources Officer (CHRO)</SelectItem>
                  <SelectItem value="cpo">Chief Product Officer (CPO)</SelectItem>
                  <SelectItem value="vp-engineering">VP of Engineering</SelectItem>
                  <SelectItem value="vp-marketing">VP of Marketing</SelectItem>
                  <SelectItem value="vp-sales">VP of Sales</SelectItem>
                  <SelectItem value="vp-product">VP of Product</SelectItem>
                  <SelectItem value="head-of-design">Head of Design</SelectItem>
                  <SelectItem value="head-of-operations">Head of Operations</SelectItem>
                  <SelectItem value="head-of-growth">Head of Growth</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                  <SelectItem value="engineering-manager">Engineering Manager</SelectItem>
                  <SelectItem value="design-lead">Design Lead</SelectItem>
                  <SelectItem value="software-engineer">Software Engineer</SelectItem>
                  <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                  <SelectItem value="sales-manager">Sales Manager</SelectItem>
                  <SelectItem value="hr-manager">HR Manager</SelectItem>
                  <SelectItem value="data-scientist">Data Scientist</SelectItem>
                  <SelectItem value="business-analyst">Business Analyst</SelectItem>
                  <SelectItem value="growth-hacker">Growth Hacker</SelectItem>
                  <SelectItem value="customer-success-manager">Customer Success Manager</SelectItem>
                  <SelectItem value="support-lead">Support Lead</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none text-[#040924]" htmlFor="website">
              Company's website
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="website" 
                placeholder="https://yourcompany.com" 
                className="pl-10 text-[#040924] border-[#040924]/20 focus:border-[#040924]/50"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={handleInputFocus}
              />
            </div>

            {showResults && (
              <div className="relative z-10">
                <div className="absolute w-full bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-lg">
                  {results.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {results.map((brand, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                          onClick={() => handleSelectCompany(brand)}
                        >
                          {brand.icon && (
                            <img
                              src={brand.icon}
                              alt={`${brand.name} logo`}
                              className="w-6 h-6 mr-3"
                            />
                          )}
                          <div>
                            <p className="font-medium text-[#040924]">{brand.name}</p>
                            <p className="text-sm text-[#040924]/70">{brand.domain}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    searchQuery.length > 2 && (
                      <div className="p-4 text-center text-sm text-[#040924]/70">No results found</div>
                    )
                  )}
                </div>
              </div>
            )}

            {selectedCompany && (
              <div className="flex items-center gap-3 p-2 border rounded-lg mt-2">
                {selectedCompany.icon && (
                  <img
                    src={selectedCompany.icon}
                    alt={`${selectedCompany.name} logo`}
                    className="w-8 h-8 rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-[#040924]">{selectedCompany.name}</p>
                  <p className="text-sm text-[#040924]/70">{selectedCompany.domain}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardContent>
          <Button 
            className="w-full bg-[#040924] hover:bg-[#040924]/90 text-white"
            onClick={handleContinue}
            disabled={!selectedCompany || !name || !role || loading}
          >
            {loading ? 'Saving...' : 'Continue'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}