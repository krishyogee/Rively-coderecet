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
import { Building2, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@apollo/client';
import { CREATE_TRACKED_COMPANIES } from '@/graphql/tracked-company/mutation';

interface Brand {
  domain: string;
  icon: string;
  name: string;
}

interface TrackedCompany extends Brand {
  type: string;
  interests: string[];
}

export default function ChooseCompanies() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Brand[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Brand | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [companyType, setCompanyType] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [trackedCompanies, setTrackedCompanies] = useState<TrackedCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientId = '1idyJSKpER3b8yHqXHV';

  const [createTrackedCompany] = useMutation(CREATE_TRACKED_COMPANIES);

  const interestsOptions = [
    'Product Offering', 'Pricing', 'M&A', 'Layoffs',
    'Content Marketing', 'Tech stack', 'Vendors',
    'Market Entry', 'Management changes', 'Fundraising',
    'Specs', 'Event Participation', 'Media Mentions',
    'Partnerships, Clients', 'Hiring', 'Corporate Filings'
  ];

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);
    setError(null);

    if (query.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${clientId}`
        );
        const data = await response.json();
        setResults(data.slice(0, 3));
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

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleTrackCompany = () => {
    if (!selectedCompany || !companyType || selectedInterests.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please select a company, type, and at least one interest.',
        duration: 5000,
        variant: 'destructive',
      });
      setError('Please select a company, type, and at least one interest.');
      return;
    }

    if (trackedCompanies.length >= 3) {
      toast({
        title: 'Limit reached',
        description: 'You can track up to 3 companies.',
        duration: 5000,
        variant: 'destructive',
      });
      return;
    }

    setTrackedCompanies([
      ...trackedCompanies,
      { ...selectedCompany, type: companyType, interests: selectedInterests },
    ]);
    setSelectedCompany(null);
    setSearchQuery('');
    setCompanyType('');
    setSelectedInterests([]);
    setShowResults(false);
    setError(null);
  };

  const handleRemoveCompany = (domain: string) => {
    setTrackedCompanies(trackedCompanies.filter((company) => company.domain !== domain));
  };

  const handleProceed = async () => {
    if (trackedCompanies.length < 1) {
      toast({
        title: 'Minimum not met',
        description: 'Please track at least 1 company to proceed.',
        duration: 5000,
        variant: 'destructive',
      });
      return;
    }

    setMutationLoading(true);
    try {
      const input = trackedCompanies.map(company => ({
        name: company.name,
        domain: company.domain,
        type: company.type,
        interests: company.interests,
      }));

      const { data } = await createTrackedCompany({
        variables: { input },
      });

      if (data?.createTrackedCompany) {
        toast({
          title: 'Success!',
          description: 'Companies have been tracked successfully.',
          variant: 'default',
        });
        router.push('/onboarding/hold-on');
      }
    } catch (error: any) {
      console.error('Error tracking companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to track companies. Please try again.',
        duration: 5000,
        variant: 'destructive',
      });
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6 min-h-screen">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-xl text-[13px]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center text-[#040924]">
              Choose Companies to Track
            </CardTitle>
            <CardDescription className="text-center text-[#040924]/80 text-sm">
              Select up to 3 companies to monitor
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#040924]" htmlFor="website">
                Company website
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="website"
                  placeholder="https://company.com"
                  className="pl-10 text-[#040924] border-[#040924]/20 focus:border-[#040924]/50 text-sm h-10"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={handleInputFocus}
                />
              </div>

              {showResults && (
                <div className="relative z-10">
                  <div className="absolute w-full bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-lg">
                    {results.length > 0 ? (
                      <div className="max-h-44 overflow-y-auto">
                        {results.map((brand, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                            onClick={() => handleSelectCompany(brand)}
                          >
                            {brand.icon && (
                              <img
                                src={brand.icon}
                                alt={`${brand.name} logo`}
                                className="w-5 h-5 mr-3"
                              />
                            )}
                            <div>
                              <p className="font-medium text-[#040924] text-sm">{brand.name}</p>
                              <p className="text-xs text-[#040924]/70">{brand.domain}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      searchQuery.length > 2 && (
                        <div className="p-4 text-center text-xs text-[#040924]/70">
                          No results found
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedCompany && (
                <div className="flex items-center gap-2 p-2 border rounded-lg mt-1">
                  {selectedCompany.icon && (
                    <img
                      src={selectedCompany.icon}
                      alt={`${selectedCompany.name} logo`}
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-[#040924] text-sm">{selectedCompany.name}</p>
                    <p className="text-xs text-[#040924]/70">{selectedCompany.domain}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#040924]" htmlFor="company-type">
                Choose company type
              </label>
              <Select
                value={companyType}
                onValueChange={(value) => setCompanyType(value)}
              >
                <SelectTrigger
                  id="company-type"
                  className="text-[#040924] border-[#040924]/20 focus:border-[#040924]/50 text-sm h-10"
                >
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent className="max-h-52 overflow-y-auto text-[#040924] text-sm">
                  <SelectItem value="competitor">Competitor</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="target-account">Target Account</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="regulator">Regulator</SelectItem>
                  <SelectItem value="own-company">Own Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#040924]">
                Choose top interests
              </label>
              <div className="overflow-y-auto" style={{ height: '80px' }}>
                <div className="flex flex-wrap gap-2">
                  {interestsOptions.map((interest) => (
                    <Button
                      key={interest}
                      variant="outline"
                      className={`text-[#040924] border-[#040924]/20 text-xs py-1 px-2 h-7 ${
                        selectedInterests.includes(interest)
                          ? 'border-[#040924] border-2'
                          : 'hover:border-[#040924]/50'
                      }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-[#040924] hover:bg-[#040924]/90 text-white text-sm py-2 h-10"
              onClick={handleTrackCompany}
              disabled={!selectedCompany || !companyType || selectedInterests.length === 0 || loading}
            >
              {loading ? 'Tracking...' : 'Track Company'}
            </Button>

            {trackedCompanies.length > 0 && (
              <div className="grid gap-2 mt-3">
                <label className="text-sm font-medium text-[#040924]">
                  Tracked Companies
                </label>
                <div className="flex flex-wrap gap-2">
                  {trackedCompanies.map((company) => (
                    <div
                      key={company.domain}
                      className="flex items-center gap-2 p-2 border rounded-full bg-gray-50"
                    >
                      {company.icon && (
                        <img
                          src={company.icon}
                          alt={`${company.name} logo`}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <p className="text-xs text-[#040924]">{company.name}</p>
                      <X
                        className="h-4 w-4 text-[#040924]/70 cursor-pointer"
                        onClick={() => handleRemoveCompany(company.domain)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full mt-4 bg-[#040924] hover:bg-[#040924]/90 text-white text-sm py-2 h-10"
              onClick={handleProceed}
              disabled={trackedCompanies.length < 1 || trackedCompanies.length > 3 || mutationLoading}
            >
              {mutationLoading ? 'Saving...' : 'Proceed'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}