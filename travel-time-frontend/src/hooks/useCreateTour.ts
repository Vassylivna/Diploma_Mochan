import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { TourService } from '../services/TourService';
import { imageUploadService } from '../services/ImageUploadService';

import { LocationService } from '../services/LocationService';
import { TransportService } from '../services/TransportService';
import { HotelService } from '../services/HotelService';
import { UserService } from '../services/UserService';

import { TourRequest, TourCard } from '../types/tour.types';
import { Location } from '../types/location.types';
import { Transport } from '../types/transport.types';
import { Hotel } from '../types/hotel.types';
import { User } from '../types/user.types';

interface TourFormState {
    title: string;
    description: string;
    price: number | ''; 
    totalSeats: number | ''; 
    startAddress: string;
    startDate: string;
    endDate: string;
    startLocationId: number;
    transportId: number;
    guideId: number | null;
    startLocation: Location | null;
    guide: User | null;
    routeSteps: { dayNumber: number; events: string[] }[];
    stops: { locationId: number; hotelId: number | null; location?: Location; hotel?: Hotel }[];
    included: string[];
    excluded: string[];
}

export const useCreateTour = () => {
    const { tourId } = useParams<{ tourId?: string }>();
    const locationState = useLocation();
    const navigate = useNavigate();
    
    const isUpdate = !!tourId;
    const restoreId = locationState.state?.restoreFromId;
    
    const [locations, setLocations] = useState<Location[]>([]);
    const [transports, setTransports] = useState<Transport[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [guides, setGuides] = useState<User[]>([]);
    const [existingTours, setExistingTours] = useState<TourCard[]>([]);

    const [initialGuide, setInitialGuide] = useState<User | null>(null);
    const [initialTransport, setInitialTransport] = useState<Transport | null>(null);

    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    const [formData, setFormData] = useState<TourFormState>({
        title: "", description: "", 
        price: '', totalSeats: '',  
        startAddress: "", startDate: "", endDate: "",
        startLocationId: 0, transportId: 0, guideId: null,
        startLocation: null, guide: null,
        routeSteps: [], stops: [],
        included: [
            "Проїзд комфортабельним автобусом",
            "Проживання в готелі",
            "Супровід гіда",
            "Екскурсії в запланованих туристичних об'єктах"
        ],
        excluded: [
            "Проїзд у не в екскурсійному транспорті",
            "Вхідні квитки в місця що не включені в тур",
            "Особисті витрати"
        ]
    });

    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImageUrl, setMainImageUrl] = useState<string>(""); 
    const [galleryItems, setGalleryItems] = useState<(File | string)[]>([]);
    const [galleryUrlInput, setGalleryUrlInput] = useState("");

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
    const [errors, setErrors] = useState<any>({});
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
    const [confirmExitOpen, setConfirmExitOpen] = useState(false);

    const getCurrentDateTimeISO = () => {
        return new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Kiev' }).slice(0, 16).replace(' ', 'T');
    };
    const currentDateTime = getCurrentDateTimeISO();

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const [locs, hots, tours] = await Promise.all([
                    LocationService.getAllActive(),
                    HotelService.getAllActive(),
                    TourService.getAll({}, 1, 100).then(r => r.content)
                ]);
                
                setLocations(locs);
                setHotels(hots);
                setExistingTours(tours);

                const fetchId = isUpdate ? Number(tourId) : (restoreId ? Number(restoreId) : null);
                
                if (fetchId) {
                    const tour = await TourService.getById(fetchId);
                    const formatForInput = (isoString: string) => {
                        if (!isoString) return "";
                        return new Date(isoString).toLocaleString('sv-SE').slice(0, 16).replace(' ', 'T');
                    };

                    if (tour.guide) setInitialGuide(tour.guide);
                    if (tour.transport) setInitialTransport(tour.transport as unknown as Transport);

                    setFormData({
                        title: tour.title, description: tour.description,
                        price: tour.price, 
                        totalSeats: tour.totalSeats,
                        startAddress: tour.startAddress,
                        startDate: restoreId ? "" : formatForInput(tour.startDate), 
                        endDate: restoreId ? "" : formatForInput(tour.endDate),
                        startLocationId: tour.startLocation.locationId,
                        transportId: tour.transport.transportId,
                        guideId: restoreId ? null : (tour.guide?.userId || null),
                        startLocation: tour.startLocation,
                        guide: restoreId ? null : (tour.guide || null),
                        stops: tour.stops.map(s => ({ 
                            locationId: s.location?.locationId || 0, 
                            hotelId: s.hotel?.hotelId || null, 
                            location: s.location, 
                            hotel: s.hotel 
                        })),
                        routeSteps: tour.routeSteps.map(s => ({ dayNumber: s.dayNumber, events: s.events.map(e => e.description) })),
                        included: tour.inclusions.filter(i => i.isIncluded).map(i => i.itemDescription),
                        excluded: tour.inclusions.filter(i => !i.isIncluded).map(i => i.itemDescription)
                    });

                    if (tour.images.length > 0) {
                        setMainImageUrl(tour.images[0].imageUrl); 
                        setGalleryItems(tour.images.slice(1).map(i => i.imageUrl)); 
                    }
                }
            } catch (e) { console.error(e); } finally { setIsLoading(false); }
        };
        init();
    }, [isUpdate, tourId, restoreId]);

    useEffect(() => {
        const fetchResources = async () => {
            let startISO = undefined;
            let endISO = undefined;

            if (formData.startDate && formData.endDate) {
                if (new Date(formData.endDate) > new Date(formData.startDate)) {
                    startISO = new Date(formData.startDate).toISOString();
                    endISO = new Date(formData.endDate).toISOString();
                }
            }

            try {
                const [activeTransports, guidesResponse] = await Promise.all([
                    TransportService.getAllActive(startISO, endISO),
                    UserService.getPaginatedUsers(1, 100, '', 'GUIDE', 'all', startISO, endISO)
                ]);

                let availableTransports = activeTransports;
                let availableGuides = guidesResponse.content;

                if (isUpdate) {
                    if (initialGuide && !availableGuides.find(g => g.userId === initialGuide.userId)) {
                        availableGuides = [initialGuide, ...availableGuides];
                    }
                    if (initialTransport && !availableTransports.find(t => t.transportId === initialTransport.transportId)) {
                        availableTransports = [initialTransport, ...availableTransports];
                    }
                }

                setTransports(availableTransports);
                setGuides(availableGuides);

            } catch (e) {
                console.error("Error fetching available resources", e);
            }
        };

        fetchResources();
    }, [formData.startDate, formData.endDate, isUpdate, initialGuide, initialTransport]);


    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end < start) return;

            const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            const diffTime = endDay.getTime() - startDay.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (diffDays > 0) {
                setFormData(prev => {
                    const currentSteps = prev.routeSteps;
                    if (currentSteps.length === diffDays) return prev;
                    let newSteps;
                    if (currentSteps.length < diffDays) {
                        const added = Array.from({ length: diffDays - currentSteps.length }, (_, i) => ({
                            dayNumber: currentSteps.length + i + 1, events: [""]
                        }));
                        newSteps = [...currentSteps, ...added];
                    } else {
                        newSteps = currentSteps.slice(0, diffDays);
                    }
                    return { ...prev, routeSteps: newSteps };
                });
            }
        }
    }, [formData.startDate, formData.endDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
        if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: null }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '') {
            setFormData(prev => ({ ...prev, [name]: '' }));
            if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: null }));
            return;
        }
        if (value === '0' || value.startsWith('0')) return; 
        if (!/^[1-9]\d*$/.test(value)) return;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
        setIsDirty(true);
        if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: null }));
    };

    const preventInvalidNumberInput = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
        const input = e.target as HTMLInputElement;
        if (e.key === '0' && input.value === '') e.preventDefault();
    };

    const handleListChange = (listName: 'included' | 'excluded', index: number, value: string) => {
        setFormData(prev => {
            const newList = [...prev[listName]];
            newList[index] = value;
            return { ...prev, [listName]: newList };
        });
        setIsDirty(true);
    };

    const addListItem = (listName: 'included' | 'excluded') => {
        setFormData(prev => ({ ...prev, [listName]: [...prev[listName], ""] }));
    };

    const removeListItem = (listName: 'included' | 'excluded', index: number) => {
        setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
    };

    const handleEventChange = (dayIdx: number, eventIdx: number, val: string) => {
        const steps = [...formData.routeSteps];
        steps[dayIdx].events[eventIdx] = val;
        setFormData(p => ({ ...p, routeSteps: steps }));
        setIsDirty(true);
    };
    const addEvent = (dayIdx: number) => {
        const steps = [...formData.routeSteps];
        steps[dayIdx].events.push("");
        setFormData(p => ({ ...p, routeSteps: steps }));
    };
    const removeEvent = (dayIdx: number, eventIdx: number) => {
        const steps = [...formData.routeSteps];
        steps[dayIdx].events = steps[dayIdx].events.filter((_, i) => i !== eventIdx);
        setFormData(p => ({ ...p, routeSteps: steps }));
    };

    const addStop = () => setFormData(p => ({ ...p, stops: [...p.stops, { locationId: 0, hotelId: null }] }));
    const updateStop = (idx: number, field: string, val: any) => {
        const stops = [...formData.stops];
        if (field === 'location') stops[idx] = { ...stops[idx], location: val, locationId: val ? val.locationId : 0 };
        else if (field === 'hotel') stops[idx] = { ...stops[idx], hotel: val, hotelId: val ? val.hotelId : null };
        setFormData(p => ({ ...p, stops }));
        setIsDirty(true);
    };
    const removeStop = (idx: number) => setFormData(p => ({ ...p, stops: p.stops.filter((_, i) => i !== idx) }));

    const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMainImageFile(e.target.files[0]); setMainImageUrl(""); setIsDirty(true);
        }
    };
    const handleMainUrlChange = (val: string) => { setMainImageUrl(val); setMainImageFile(null); setIsDirty(true); };
    const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) { setGalleryItems(p => [...p, ...Array.from(e.target.files!)]); setIsDirty(true); }
    };
    const handleAddGalleryUrl = () => { if (galleryUrlInput.trim()) { setGalleryItems(p => [...p, galleryUrlInput]); setGalleryUrlInput(""); setIsDirty(true); } };
    const removeGalleryItem = (index: number) => { setGalleryItems(p => p.filter((_, i) => i !== index)); setIsDirty(true); };
    const getMainPreview = () => { if (mainImageFile) return URL.createObjectURL(mainImageFile); if (mainImageUrl) return mainImageUrl; return ""; };

    const validateStep = (step: number) => {
        const newErrors: any = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.title) newErrors.title = "Введіть назву";
            if (!formData.description) newErrors.description = "Введіть опис";
            if (formData.price === '' || Number(formData.price) <= 0) newErrors.price = "Введіть коректну ціну";
            if (formData.totalSeats === '' || Number(formData.totalSeats) <= 0) newErrors.totalSeats = "Введіть кількість місць";
            if (!formData.guideId) newErrors.guideId = "Оберіть гіда";

            if (!formData.startDate) {
                newErrors.startDate = "Оберіть дату початку";
            } else {
                const start = new Date(formData.startDate);
                const now = new Date();
                now.setSeconds(0, 0); 
                
                if (start < now) {
                    newErrors.startDate = "Дата початку не може бути в минулому!";
                }
            }

            if (!formData.endDate) {
                newErrors.endDate = "Оберіть дату завершення";
            } else if (formData.startDate) {
                const start = new Date(formData.startDate);
                const end = new Date(formData.endDate);
                if (end <= start) {
                    newErrors.endDate = "Дата завершення має бути пізніше дати початку";
                }
            }
        }
        
        if (step === 1) {
            if (!formData.transportId) newErrors.transportId = "Оберіть транспорт";
            if (!formData.startLocationId) newErrors.startLocation = "Оберіть місце збору";
            if (!formData.startAddress) newErrors.startAddress = "Введіть адресу";
            
            const hasAtLeastOneHotel = formData.stops.some(stop => stop.hotelId && stop.hotelId !== 0);
            if (!hasAtLeastOneHotel) {
                newErrors.stops = "Необхідно обрати хоча б один готель у маршруті";
                setSnackbar({ open: true, message: "Оберіть хоча б один готель для зупинки", severity: "error" });
                isValid = false; 
            }
            formData.stops.forEach((stop, i) => { if (!stop.locationId) newErrors[`stop_loc_${i}`] = "Оберіть локацію"; });
        }
        
        if (step === 2) {
            let hasProgramErrors = false;
            formData.routeSteps.forEach((day, index) => {
                const dayHasEmptyEvent = day.events.some(ev => ev.trim() === "");
                if (day.events.length === 0 || dayHasEmptyEvent) {
                    newErrors[`day_error_${index}`] = `День ${day.dayNumber}: всі події мають бути заповнені!`;
                    hasProgramErrors = true;
                }
            });
            if (hasProgramErrors) {
                setSnackbar({ open: true, message: "Заповніть всі події програми!", severity: "error" });
                isValid = false;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            if (!newErrors.stops && step !== 2) setSnackbar({ open: true, message: "Виправте помилки", severity: "error" });
        }
        return isValid;
    };

    const handleNext = () => { if (validateStep(activeStep)) setActiveStep(p => p + 1); };
    const handleBack = () => setActiveStep(p => p - 1);

    const handlePreSaveCheck = () => {
        if (!mainImageFile && !mainImageUrl) { setSnackbar({ open: true, message: "Додайте головне фото", severity: "error" }); return; }
        setConfirmSaveOpen(true);
    };

    const handleConfirmSave = async () => {
        setConfirmSaveOpen(false); setIsLoading(true);
        try {
            let finalMainUrl = mainImageFile ? await imageUploadService.uploadImage(mainImageFile) : mainImageUrl;
            const galleryPromises = galleryItems.map(async (item) => item instanceof File ? await imageUploadService.uploadImage(item) : item);
            const uploadedGalleryUrls = await Promise.all(galleryPromises);
            const finalImagesArray = [finalMainUrl, ...uploadedGalleryUrls].filter(url => url && url.trim() !== "");

            const payload: TourRequest = {
                title: formData.title, description: formData.description,
                price: Number(formData.price), totalSeats: Number(formData.totalSeats),
                startAddress: formData.startAddress,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                startLocationId: Number(formData.startLocationId),
                transportId: Number(formData.transportId),
                guideId: formData.guideId ? Number(formData.guideId) : null,
                stops: formData.stops.map(s => ({ locationId: s.locationId, hotelId: s.hotelId })),
                routeSteps: formData.routeSteps, 
                images: finalImagesArray,
                inclusions: [...formData.included.map(d => ({ itemDescription: d, isIncluded: true })), ...formData.excluded.map(d => ({ itemDescription: d, isIncluded: false }))]
            };

            if (isUpdate) { 
                await TourService.update(Number(tourId), payload); 
                setSnackbar({ open: true, message: "Тур оновлено", severity: "success" }); 
            } else { 
                await TourService.create(payload); 
                setSnackbar({ open: true, message: "Тур створено", severity: "success" });
                
                // [NEW]: Якщо це було відновлення (restoreId), видаляємо старий архівний тур
                if (restoreId) {
                    try {
                        await TourService.delete(Number(restoreId));
                    } catch (e) {
                        console.error("Failed to delete restored tour", e);
                    }
                }
            }
            setTimeout(() => navigate('/management/tours'), 1000);
        } catch (error) { console.error("Save error:", error); } finally { setIsSaving(false); }
    };

    return {
        locations, transports, hotels, guides, existingTours, formData, setFormData, routeSteps: formData.routeSteps, 
        activeStep, setActiveStep, isLoading, isSaving, isDirty, errors, setErrors, snackbar, setSnackbar,
        confirmSaveOpen, setConfirmSaveOpen, confirmExitOpen, setConfirmExitOpen, currentDateTime, isUpdate,
        mainImageFile, mainImageUrl, galleryItems, galleryUrlInput, setGalleryUrlInput,
        handleChange, handleNumberChange, handleListChange, addListItem, removeListItem, addStop, removeStop, updateStop,
        handleEventChange, addEvent, removeEvent,
        handleMainFileSelect, handleMainUrlChange, getMainPreview, handleGallerySelect, handleAddGalleryUrl, removeGalleryItem,
        handleNext, handleBack, preventInvalidNumberInput, handlePreSaveCheck, handleConfirmSave
    };
};