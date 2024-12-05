import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  InfoIcon, 
  TagIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// TypeScript interfaces
interface InterestCategory {
  category_id: number;
  category_name: string;
  category_description?: string;
}

interface Interest {
  interest_id: number;
  interest_name: string;
  category_id: number;
  interest_description?: string;
}

const UserInterestsPage: React.FC = () => {
  // State management
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  // Refs for smooth scrolling
  const categoryRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Fetch categories and interests on component mount
  useEffect(() => {
    const fetchInterestsData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('interests_categories')
          .select('*')
          .order('category_name');

        // Fetch interests
        const { data: interestsData, error: interestsError } = await supabase
          .from('interests')
          .select('*')
          .order('interest_name');

        if (categoriesError || interestsError) {
          throw new Error(categoriesError?.message || interestsError?.message);
        }

        setCategories(categoriesData || []);
        setInterests(interestsData || []);

        // Fetch user's existing interests
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userInterests } = await supabase
            .from('user_interests')
            .select('interest_id')
            .eq('user_id', user.id);

          setSelectedInterests(
            userInterests?.map(ui => ui.interest_id) || []
          );
        }
      } catch (error) {
        toast.error('Failed to load interests');
      } finally {
        setLoading(false);
      }
    };

    fetchInterestsData();
  }, []);

  // Scroll to category
  const scrollToCategory = (categoryId: number) => {
    const categoryElement = categoryRefs.current[categoryId];
    if (categoryElement) {
      categoryElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Handle interest selection toggle
  const toggleInterest = (interestId: number) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };
  // Save user interests
  const saveUserInterests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Delete existing user interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Insert new user interests
      const userInterestsToInsert = selectedInterests.map(interestId => ({
        user_id: user.id,
        interest_id: interestId
      }));

      const { error } = await supabase
        .from('user_interests')
        .insert(userInterestsToInsert);

      if (error) throw error;

      toast.success('Interests saved successfully!', {
        description: `You've selected ${selectedInterests.length} interests`,
        icon: <CheckCircleIcon className="text-green-500" />
      });
      navigate('/user/listings')
    } catch (error) {
      toast.error('Failed to save interests');
    }
  };

  // Memoized interests by category
  const interestsByCategory = useMemo(() => 
    categories.map(category => ({
      ...category,
      interests: interests.filter(interest => 
        interest.category_id === category.category_id
      )
    })), [categories, interests]
  );

  // 
  const categorySidebarRef = useRef<HTMLDivElement>(null);
  const [categorySidebarHeight, setCategorySidebarHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const measureHeight = () => {
      if (categorySidebarRef.current) {
        const height = categorySidebarRef.current.offsetHeight;
        setCategorySidebarHeight(height);
      }
    };

    measureHeight();
    
    // Optional: Remeasure on resize
    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, [categories]);
  
  // Loading state
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center h-screen"
      >
        <div className="text-center">
          <SparklesIcon className="mx-auto mb-4 animate-pulse text-primary" size={64} />
          <h2 className="text-2xl font-bold">Discovering Your Interests...</h2>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="conta iner m x-auto mx -4 p y -8"
    >
      <Card className="w-full ma x-w-6xl mx-auto shadow-2xl border-none">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <TagIcon className="text-primary" />
                Personalize Your Experience
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Select interests that reflect your passions and help us tailor content just for you.
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={saveUserInterests}
                disabled={selectedInterests.length === 0}
                className="flex items-center gap-2"
              >
                <CheckCircleIcon />
                Save Interests
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent 
          ref={categorySidebarRef} 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Category Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <InfoIcon className="text-primary" />
              Interest Categories
            </h3>
            {interestsByCategory.map(category => (
              <motion.div
                key={category.category_id}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => scrollToCategory(category.category_id)}
              >
                <h4 className="font-medium">{category.category_name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.category_description || 'Explore interests in this category'}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Interests Grid */}
          <div 
            className="md:col-span-2 space-y-8 max-h-[2600px] overflow-y-auto"
          // style={{ 
          //   maxHeight: categorySidebarHeight ? `${categorySidebarHeight}px` : 'none' 
          // }}
          // className="md:col-span-2 space-y-8 overflow-y-auto"
          >
            <AnimatePresence>
              {interestsByCategory.map(category => (
                <motion.div 
                  key={category.category_id}
                  ref={(el) => categoryRefs.current[category.category_id] = el}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8"
                >
                  <h2 className="text-xl font-bold mb-4 text-primary sticky top-0 bg-white z-10">
                    {category.category_name}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {category.interests.map(interest => (
                      <motion.div 
                        key={interest.interest_id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          p-4 rounded-lg border transition-all 
                          ${selectedInterests.includes(interest.interest_id) 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50'}
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`interest-${interest.interest_id}`}
                            checked={selectedInterests.includes(interest.interest_id)}
                            onCheckedChange={() => toggleInterest(interest.interest_id)}
                          />
                          <label
                            htmlFor={`interest-${interest.interest_id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {interest.interest_name}
                          </label>
                        </div>
                        {selectedInterests.includes(interest.interest_id) && (
                          <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs text-muted-foreground mt-2"
                          >
                            {interest.interest_description || 'A fascinating interest you\'ve selected!'}
                          </motion.p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserInterestsPage;