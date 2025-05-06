import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Check, CalendarIcon, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Child } from "@/lib/types";
import { format, addDays } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import AvailableScheduledSitters from "./AvailableScheduledSitters";

// Form validation schema
const scheduledCareSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  endTime: z.string({
    required_error: "Please select an end time",
  }),
  children: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).min(1, "Please select at least one child"),
  careInstructions: z.string().optional(),
});

type ScheduledCareFormData = z.infer<typeof scheduledCareSchema>;

interface ScheduledCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduledCareModal({ isOpen, onClose }: ScheduledCareModalProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hoursNeeded, setHoursNeeded] = useState(2);
  const [showAvailableSitters, setShowAvailableSitters] = useState(false);
  const [playAndGreetStatus, setPlayAndGreetStatus] = useState<{[key: string]: boolean}>({});
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: boolean}>({});
  
  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: new Date(),
        startTime: "",
        endTime: "",
        children: [],
        careInstructions: ""
      });
    }
  }, [isOpen]);
  
  // Mock child data - in a real app, this would be fetched from user's children
  const childOptions: { id: string; name: string }[] = [
    { id: "1", name: "Emma" },
    { id: "2", name: "Noah" },
    { id: "3", name: "Olivia" },
    { id: "4", name: "Liam" },
  ];

  const form = useForm<ScheduledCareFormData>({
    resolver: zodResolver(scheduledCareSchema),
    defaultValues: {
      date: new Date(),
      children: [],
      careInstructions: "",
    },
  });

  // Generate time slots for select
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0);
        slots.push({
          value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          label: format(time, 'h:mm a')
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const onSubmit = (data: ScheduledCareFormData) => {
    console.log("Scheduled care form submitted:", data);
    // Here you would normally send this data to your backend
    setShowAvailableSitters(true);
    onClose();
  };
  
  const handlePlayAndGreet = (sitterId: number) => {
    setPlayAndGreetStatus(prev => ({
      ...prev,
      [sitterId.toString()]: true
    }));
  };
  
  const handleBookNow = (sitterId: number) => {
    setBookingStatus(prev => ({
      ...prev,
      [sitterId.toString()]: true
    }));
  };

  return (
    <>
      <AvailableScheduledSitters
        isOpen={showAvailableSitters}
        onClose={() => {
          setShowAvailableSitters(false);
          form.reset();
        }}
        onPlayAndGreet={handlePlayAndGreet}
        onBookNow={handleBookNow}
        date={date || new Date()}
        startTime={form.getValues().startTime || ""}
        endTime={form.getValues().endTime || ""}
        playAndGreetStatus={playAndGreetStatus}
        bookingStatus={bookingStatus}
      />
    
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Schedule Childcare</DialogTitle>
            <DialogDescription>
              Request a babysitter up to 7 days in advance.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMMM d, yyyy")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                              setDate(date);
                            }
                          }}
                          disabled={(date) => 
                            date < new Date() || date > addDays(new Date(), 7)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mb-4">
                <FormLabel>Hours Needed</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {hoursNeeded ? `${hoursNeeded} ${hoursNeeded === 1 ? 'hour' : 'hours'}` : "Select hours..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px]">
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                        <div
                          key={hours}
                          className={`flex items-center space-x-2 rounded px-2 py-1 hover:bg-accent cursor-pointer ${
                            hoursNeeded === hours ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            setHoursNeeded(hours);
                            
                            // Update end time based on start time and hours
                            const startTimeValue = form.getValues().startTime;
                            if (startTimeValue) {
                              const [startHour, startMinute] = startTimeValue.split(':').map(Number);
                              const endDate = new Date();
                              endDate.setHours(startHour, startMinute, 0);
                              endDate.setHours(endDate.getHours() + hours);
                              
                              const endHour = endDate.getHours().toString().padStart(2, '0');
                              const endMinute = endDate.getMinutes().toString().padStart(2, '0');
                              const newEndTime = `${endHour}:${endMinute}`;
                              
                              form.setValue('endTime', newEndTime);
                            }
                          }}
                        >
                          <div>{hours} {hours === 1 ? 'hour' : 'hours'}</div>
                          {hoursNeeded === hours && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t flex justify-end">
                        <Button 
                          type="button" 
                          style={{ backgroundColor: "#3c5679" }}
                          className="text-white font-medium"
                          onClick={() => {
                            const popover = document.querySelector('[role="combobox"]');
                            if (popover) {
                              (popover as HTMLElement).click();
                            }
                          }}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select start time" />
                            <Clock className="ml-2 h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select end time" />
                            <Clock className="ml-2 h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Children</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value?.length && "text-muted-foreground"
                            )}
                          >
                            {field.value?.length > 0
                              ? `${field.value.length} children selected`
                              : "Select children..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <div className="p-4 space-y-2">
                            {childOptions.map((child) => {
                              const isSelected = field.value?.some(
                                (selectedChild) => selectedChild.id === child.id
                              );
                              return (
                                <div
                                  key={child.id}
                                  className="flex items-center space-x-2 rounded px-2 py-1 hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    const newValue = isSelected
                                      ? field.value.filter(
                                          (selectedChild) => selectedChild.id !== child.id
                                        )
                                      : [...(field.value || []), child];
                                    field.onChange(newValue);
                                  }}
                                >
                                  <Checkbox checked={isSelected} />
                                  <div>{child.name}</div>
                                  {isSelected && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </div>
                              );
                            })}
                            <div className="mt-4 pt-3 border-t flex justify-end">
                              <Button 
                                type="button" 
                                style={{ backgroundColor: "#3c5679" }}
                                className="text-white font-medium"
                                onClick={() => {
                                  const popover = document.querySelector('[role="combobox"]');
                                  if (popover) {
                                    (popover as HTMLElement).click();
                                  }
                                }}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((child) => (
                        <Badge key={child.id} variant="outline" className="py-1 border-brand-pink text-brand-blue">
                          {child.name}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer" 
                            onClick={() => {
                              field.onChange(
                                field.value.filter(
                                  (selectedChild) => selectedChild.id !== child.id
                                )
                              );
                            }} 
                          />
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="careInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Special needs, meal times, bedtime routine, activities, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                style={{ backgroundColor: "#3c5679" }}
                className="w-full text-white font-medium"
              >
                Schedule Sitter
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}