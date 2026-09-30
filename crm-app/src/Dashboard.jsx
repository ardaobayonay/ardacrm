import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { ChevronRight, ChevronDown, ArrowLeft, Building2, Phone, Mail, User, MapPin, Search, Plus, TrendingUp, Users, CheckCircle2, Globe2, Save, Trash2 } from 'lucide-react';

const regions = [
  { id: 'weu', name: 'Batı Avrupa', color: '#007aff', countries: [{ tr: 'Almanya', en: 'Germany' }, { tr: 'Avusturya', en: 'Austria' }, { tr: 'Belçika', en: 'Belgium' }, { tr: 'Birleşik Krallık', en: 'United Kingdom' }, { tr: 'Fransa', en: 'France' }, { tr: 'Hollanda', en: 'Netherlands' }, { tr: 'İrlanda', en: 'Ireland' }, { tr: 'İsviçre', en: 'Switzerland' }, { tr: 'Lüksemburg', en: 'Luxembourg' }] },
  { id: 'neu', name: 'Kuzey Avrupa', color: '#34c759', countries: [{ tr: 'Danimarka', en: 'Denmark' }, { tr: 'Estonya', en: 'Estonia' }, { tr: 'Finlandiya', en: 'Finland' }, { tr: 'İsveç', en: 'Sweden' }, { tr: 'İzlanda', en: 'Iceland' }, { tr: 'Letonya', en: 'Latvia' }, { tr: 'Litvanya', en: 'Lithuania' }, { tr: 'Norveç', en: 'Norway' }] },
  { id: 'cee', name: 'Orta ve Doğu Avrupa', color: '#ff9500', countries: [{ tr: 'Belarus', en: 'Belarus' }, { tr: 'Bulgaristan', en: 'Bulgaria' }, { tr: 'Çekya', en: 'Czechia' }, { tr: 'Macaristan', en: 'Hungary' }, { tr: 'Moldova', en: 'Moldova' }, { tr: 'Polonya', en: 'Poland' }, { tr: 'Romanya', en: 'Romania' }, { tr: 'Rusya', en: 'Russia' }, { tr: 'Slovakya', en: 'Slovakia' }, { tr: 'Ukrayna', en: 'Ukraine' }] },
  { id: 'seu', name: 'Güney Avrupa', color: '#ff3b30', countries: [{ tr: 'Arnavutluk', en: 'Albania' }, { tr: 'Bosna-Hersek', en: 'Bosnia and Herzegovina' }, { tr: 'Hırvatistan', en: 'Croatia' }, { tr: 'İspanya', en: 'Spain' }, { tr: 'İtalya', en: 'Italy' }, { tr: 'Karadağ', en: 'Montenegro' }, { tr: 'Kıbrıs', en: 'Cyprus' }, { tr: 'Kuzey Makedonya', en: 'North Macedonia' }, { tr: 'Malta', en: 'Malta' }, { tr: 'Portekiz', en: 'Portugal' }, { tr: 'Sırbistan', en: 'Serbia' }, { tr: 'Slovenya', en: 'Slovenia' }, { tr: 'Türkiye', en: 'Turkey' }, { tr: 'Yunanistan', en: 'Greece' }] },
  { id: 'nam', name: 'Kuzey Amerika', color: '#5856d6', countries: [{ tr: 'Amerika Birleşik Devletleri', en: 'United States' }, { tr: 'Kanada', en: 'Canada' }, { tr: 'Meksika', en: 'Mexico' }] },
  { id: 'sam', name: 'Güney Amerika', color: '#af52de', countries: [{ tr: 'Arjantin', en: 'Argentina' }, { tr: 'Brezilya', en: 'Brazil' }, { tr: 'Kolombiya', en: 'Colombia' }, { tr: 'Şili', en: 'Chile' }, { tr: 'Peru', en: 'Peru' }] },
  { id: 'asia', name: 'Asya', color: '#ff2d55', countries: [{ tr: 'Çin', en: 'China' }, { tr: 'Japonya', en: 'Japan' }, { tr: 'Güney Kore', en: 'South Korea' }, { tr: 'Hindistan', en: 'India' }, { tr: 'Birleşik Arap Emirlikleri', en: 'United Arab Emirates' }, { tr: 'Suudi Arabistan', en: 'Saudi Arabia' }, { tr: 'Singapur', en: 'Singapore' }, { tr: 'Malezya', en: 'Malaysia' }, { tr: 'İsrail', en: 'Israel' }, { tr: 'Katar', en: 'Qatar' }] },
  { id: 'oce', name: 'Okyanusya', color: '#5ac8fa', countries: [{ tr: 'Avustralya', en: 'Australia' }, { tr: 'Yeni Zelanda', en: 'New Zealand' }] },
  { id: 'afr', name: 'Afrika', color: '#ffcc00', countries: [{ tr: 'Güney Afrika', en: 'South Africa' }, { tr: 'Mısır', en: 'Egypt' }, { tr: 'Fas', en: 'Morocco' }, { tr: 'Nijerya', en: 'Nigeria' }, { tr: 'Kenya', en: 'Kenya' }] }
];

export default function Dashboard() {
  const navigate = useNavigate(); 
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedLocation, setSelectedLocation] = useState({ id: '', displayName: '' }); 
  const [selectedCategory, setSelectedCategory] = useState({ id: '', displayName: '' }); 
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [expandedRegion, setExpandedRegion] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState(''); 
  const [companies, setCompanies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', region: 'Batı Avrupa', country: 'Almanya', city: '', sector: '', contactName: '', title: '', email: '', phone: '', status: 'İlk Temas', notes: '' });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('*').order('id', { ascending: false });
    if (data) setCompanies(data);
    if (error) console.error("Veri çekme hatası:", error.message);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/'); 
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('companies').insert([newCompany]);
    if (!error) {
      await fetchCompanies(); 
      setCurrentView('home'); 
      setNewCompany({ name: '', region: 'Batı Avrupa', country: 'Almanya', city: '', sector: '', contactName: '', title: '', email: '', phone: '', status: 'İlk Temas', notes: '' }); 
    }
    setIsSubmitting(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('companies').update(editCompany).eq('id', editCompany.id);
    if (!error) {
      await fetchCompanies(); 
      setSelectedCompany(editCompany); 
      setIsEditing(false); 
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`${editCompany.name} firmasını kalıcı olarak silmek istediğinize emin misiniz?`);
    if (!confirmDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('companies').delete().eq('id', editCompany.id);
    if (!error) {
      await fetchCompanies();
      setIsEditing(false);
      setSelectedCompany(null);
      setCurrentView('companyList'); 
    }
    setIsDeleting(false);
  };

  const activeRegionObjEdit = editCompany ? regions.find(r => r.name === editCompany.region) : null;
  const availableCountriesEdit = activeRegionObjEdit ? activeRegionObjEdit.countries : [];
  const handleRegionChangeEdit = (e) => {
    const selectedReg = e.target.value;
    const regObj = regions.find(r => r.name === selectedReg);
    setEditCompany({ ...editCompany, region: selectedReg, country: regObj ? regObj.countries[0].tr : '' });
  };

  const activeRegionObj = regions.find(r => r.name === newCompany.region);
  const availableCountries = activeRegionObj ? activeRegionObj.countries : [];
  const handleRegionChange = (e) => {
    const selectedReg = e.target.value;
    const regObj = regions.find(r => r.name === selectedReg);
    setNewCompany({ ...newCompany, region: selectedReg, country: regObj ? regObj.countries[0].tr : '' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Günaydın';
    if (hour >= 12 && hour < 18) return 'İyi Günler';
    if (hour >= 18 && hour < 22) return 'İyi Akşamlar';
    return 'İyi Geceler';
  };

  const toggleRegion = (regionName) => {
    if (expandedRegion === regionName) setExpandedRegion(null);
    else setExpandedRegion(regionName);
  };

  const handleLocationClick = (countryId, countryDisplayName) => {
    setSearchQuery(''); setContactSearchQuery(''); setSelectedCategory({ id: '', displayName: '' }); 
    setSelectedLocation({ id: countryId, displayName: countryDisplayName });
    setCurrentView('companyList');
  };

  const handleWidgetClick = (categoryId, displayName) => {
    setSearchQuery(''); setContactSearchQuery(''); setSelectedLocation({ id: '', displayName: '' }); 
    setSelectedCategory({ id: categoryId, displayName: displayName });
    setCurrentView('companyList');
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() !== '') {
      setSelectedCategory({ id: '', displayName: '' }); setCurrentView('companyList'); 
    } else setCurrentView('home');
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company); setIsEditing(false); setCurrentView('companyDetail');
  };

  const handleLogoClick = () => {
    setSearchQuery(''); setContactSearchQuery(''); setSelectedLocation({ id: '', displayName: '' }); setSelectedCategory({ id: '', displayName: '' }); setCurrentView('home');
  };

  let displayedCompanies = [];
  if (searchQuery.trim() !== '') {
    displayedCompanies = companies.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country?.toLowerCase().includes(searchQuery.toLowerCase()) || c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else if (selectedLocation.displayName !== '') {
    displayedCompanies = companies.filter(c => c.country === selectedLocation.displayName || c.country === selectedLocation.id);
  } else if (selectedCategory.id !== '') {
    if (selectedCategory.id === 'all') displayedCompanies = companies;
    else if (selectedCategory.id === 'active') displayedCompanies = companies.filter(c => c.status === 'İletişimde' || c.status === 'Teklif Verildi' || c.status === 'İlk Temas');
    else if (selectedCategory.id === 'won') displayedCompanies = companies.filter(c => c.status === 'Müşteri Oldu');
    else if (selectedCategory.id === 'contacts') {
      if (contactSearchQuery.trim() !== '') {
        displayedCompanies = companies.filter(c => c.contactName?.toLowerCase().includes(contactSearchQuery.toLowerCase()) || c.title?.toLowerCase().includes(contactSearchQuery.toLowerCase()) || c.name?.toLowerCase().includes(contactSearchQuery.toLowerCase()));
      } else displayedCompanies = companies;
    }
  }

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'İletişimde' || c.status === 'Teklif Verildi' || c.status === 'İlk Temas').length;
  const wonCompanies = companies.filter(c => c.status === 'Müşteri Oldu').length;

  let listTitle = 'Firmalar';
  if (searchQuery) listTitle = 'Arama Sonuçları';
  else if (selectedLocation.displayName) listTitle = selectedLocation.displayName;
  else if (selectedCategory.displayName) listTitle = selectedCategory.displayName;

  return (
    <div className="app-container">
      {/* SOL MENÜ */}
      <div className="app-sidebar">
        <div style={styles.sidebarHeader} onClick={handleLogoClick}>
          <h1 style={styles.largeTitle}>Firma Takip</h1> 
        </div>
        
        <div style={styles.searchContainer}>
          <div style={styles.searchBar}>
            <Search size={16} color="#86868b" />
            <input type="text" placeholder="Ara" value={searchQuery} onChange={handleSearch} style={styles.searchInput} />
          </div>
        </div>
        
        <div style={styles.regionList} className="hide-scrollbar">
          <div style={styles.listGroup}>
            {regions.map((region) => (
              <div key={region.id}>
                <div className="hover-item" style={styles.listItem} onClick={() => toggleRegion(region.name)}>
                  <div style={styles.listItemLeft}>
                    <div style={{...styles.iconSquircle, backgroundColor: region.color}}>
                      <Globe2 size={16} color="#fff" />
                    </div>
                    <span style={styles.listItemText}>{region.name}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <span style={styles.secondaryText}>{region.countries.length}</span>
                    {expandedRegion === region.name ? <ChevronDown size={18} color="#c7c7cc" /> : <ChevronRight size={18} color="#c7c7cc" />}
                  </div>
                </div>
                {expandedRegion === region.name && (
                  <div style={styles.subListGroup}>
                    {region.countries.map((country) => (
                      <div key={country.en} className="hover-item" style={styles.subListItem} onClick={() => handleLocationClick(country.en, country.tr)}>
                        <span style={styles.listItemText}>{country.tr}</span>
                        <ChevronRight size={16} color="#c7c7cc" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 12px 20px 12px' }}>
          <div style={styles.listGroup}>
            <div className="hover-item" style={{...styles.listItem, justifyContent: 'center'}} onClick={handleLogout}>
              <span style={{fontSize: '16px', fontWeight: 500, color: '#ff3b30'}}>Çıkış Yap</span>
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ İÇERİK */}
      <div className="app-main">
        {currentView === 'home' && (
          <div className="content-area">
            <div style={styles.pageHeader}>
              <h1 style={styles.largeTitle}>{getGreeting()} 👋</h1>
              <button style={styles.pillButton} onClick={() => setCurrentView('addCompany')}>
                <Plus size={18} /> Yeni Ekle
              </button>
            </div>

            {/* iOS TARZI SAF BEYAZ, SİMGE İÇERMEYEN WIDGET KUTULARI */}
            <div className="stats-grid">
              <div className="widget-hover" style={styles.iosWidget} onClick={() => handleWidgetClick('all', 'Tüm Firmalar')}>
                <span style={styles.iosWidgetLabel}>Toplam Firma</span>
                <h2 style={styles.iosWidgetNumber}>{totalCompanies}</h2>
              </div>
              <div className="widget-hover" style={styles.iosWidget} onClick={() => handleWidgetClick('active', 'Aktif Görüşmeler')}>
                <span style={styles.iosWidgetLabel}>Aktif Görüşme</span>
                <h2 style={styles.iosWidgetNumber}>{activeCompanies}</h2>
              </div>
              <div className="widget-hover" style={styles.iosWidget} onClick={() => handleWidgetClick('won', 'Kazanılan Müşteriler')}>
                <span style={styles.iosWidgetLabel}>Kazanılan</span>
                <h2 style={styles.iosWidgetNumber}>{wonCompanies}</h2>
              </div>
              <div className="widget-hover" style={styles.iosWidget} onClick={() => handleWidgetClick('contacts', 'Kayıtlı Kişiler')}>
                <span style={styles.iosWidgetLabel}>Kayıtlı Kişi</span>
                <h2 style={styles.iosWidgetNumber}>{totalCompanies}</h2>
              </div>
            </div>
            
            {companies.length > 0 && (
              <>
                <h2 style={styles.sectionHeader}>SON EKLENENLER</h2>
                <div style={styles.listGroup}>
                  {companies.slice(0,3).map((company) => (
                    <div key={company.id} className="hover-item" style={styles.listItem} onClick={() => handleCompanyClick(company)}>
                      <div style={styles.listItemLeft}><span style={styles.listItemText}>{company.name}</span></div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><span style={styles.secondaryText}>{company.country}</span><ChevronRight size={18} color="#c7c7cc" /></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {currentView === 'companyList' && (
          <div className="content-area">
            <div style={styles.pageHeaderNav}>
              {!searchQuery && (<button style={styles.navButton} onClick={() => setCurrentView('home')}><ArrowLeft size={22} /> <span style={{fontSize: '17px', paddingTop: '1px'}}>Geri</span></button>)}
              <button style={styles.pillButtonSmall} onClick={() => setCurrentView('addCompany')}><Plus size={16} /> Ekle</button>
            </div>
            <h1 style={styles.largeTitle}>{listTitle}</h1>
            {selectedCategory.id === 'contacts' && (
              <div style={{...styles.searchBar, marginTop: '20px', marginBottom: '10px'}}><Search size={16} color="#86868b" /><input type="text" placeholder="Kişi, unvan veya firma ara..." value={contactSearchQuery} onChange={(e) => setContactSearchQuery(e.target.value)} style={styles.searchInput} /></div>
            )}
            {displayedCompanies.length === 0 ? (
              <p style={{color: '#86868b', marginTop: '20px', paddingLeft: '8px', fontWeight: 300}}>Kayıt bulunamadı.</p>
            ) : (
              <div style={{...styles.listGroup, marginTop: '20px'}}>
                {displayedCompanies.map((company) => (
                  <div key={company.id} className="hover-item" style={styles.listItem} onClick={() => handleCompanyClick(company)}>
                    {selectedCategory.id === 'contacts' ? (
                      <div style={styles.listItemLeftColumn}><span style={styles.listItemText}>{company.contactName || 'İsimsiz Yetkili'}</span><span style={styles.subText}>{company.title || 'Unvan Yok'} • {company.name}</span></div>
                    ) : (
                      <div style={styles.listItemLeftColumn}><span style={styles.listItemText}>{company.name}</span><span style={styles.subText}>{company.sector}</span></div>
                    )}
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {selectedCategory.id !== 'contacts' && <span style={styles.secondaryText}>{company.status}</span>}<ChevronRight size={18} color="#c7c7cc" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'addCompany' && (
          <div className="content-area">
            <div style={styles.pageHeaderNav}>
              <button style={styles.navButton} onClick={() => setCurrentView('home')}><ArrowLeft size={22} /> <span style={{fontSize: '17px', paddingTop: '1px'}}>Vazgeç</span></button>
              <button style={styles.pillButtonSmall} onClick={handleAddSubmit} disabled={isSubmitting}><Save size={16} /> {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
            <h1 style={styles.largeTitle}>Yeni Firma</h1>
            <form onSubmit={handleAddSubmit}>
              <h2 style={styles.sectionHeader}>FİRMA BİLGİLERİ</h2>
              <div style={styles.listGroup}>
                <div style={styles.detailItem}><span style={styles.listItemText}>Firma Adı</span><input style={styles.formInput} required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} /></div>
                <div style={styles.detailItem}><span style={styles.listItemText}>Bölge</span><select style={styles.formSelect} value={newCompany.region} onChange={handleRegionChange}>{regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select></div>
                <div style={styles.detailItem}><span style={styles.listItemText}>Ülke</span><select style={styles.formSelect} required value={newCompany.country} onChange={e => setNewCompany({...newCompany, country: e.target.value})}>{availableCountries.map(c => (<option key={c.en} value={c.tr}>{c.tr}</option>))}</select></div>
                <div style={styles.detailItem}><span style={styles.listItemText}>Şehir</span><input style={styles.formInput} value={newCompany.city} onChange={e => setNewCompany({...newCompany, city: e.target.value})} /></div>
                <div style={{...styles.detailItem, borderBottom: 'none'}}><span style={styles.listItemText}>Sektör</span><input style={styles.formInput} value={newCompany.sector} onChange={e => setNewCompany({...newCompany, sector: e.target.value})} /></div>
              </div>
              <h2 style={styles.sectionHeader}>İLETİŞİM BİLGİLERİ</h2>
              <div style={styles.listGroup}>
                <div style={styles.detailItem}><span style={styles.listItemText}>Yetkili Kişi</span><input style={styles.formInput} value={newCompany.contactName} onChange={e => setNewCompany({...newCompany, contactName: e.target.value})} /></div>
                <div style={styles.detailItem}><span style={styles.listItemText}>Unvan</span><input style={styles.formInput} value={newCompany.title} onChange={e => setNewCompany({...newCompany, title: e.target.value})} /></div>
                <div style={styles.detailItem}><span style={styles.listItemText}>Telefon</span><input style={styles.formInput} value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} /></div>
                <div style={{...styles.detailItem, borderBottom: 'none'}}><span style={styles.listItemText}>E-posta</span><input type="email" style={styles.formInput} value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} /></div>
              </div>
              <h2 style={styles.sectionHeader}>DURUM VE NOTLAR</h2>
              <div style={styles.listGroup}>
                <div style={styles.detailItem}><span style={styles.listItemText}>Aşama</span><select style={styles.formSelect} value={newCompany.status} onChange={e => setNewCompany({...newCompany, status: e.target.value})}><option value="İlk Temas">İlk Temas</option><option value="İletişimde">İletişimde</option><option value="Teklif Verildi">Teklif Verildi</option><option value="Müşteri Oldu">Müşteri Oldu</option><option value="Reddedildi">Reddedildi</option></select></div>
                <div style={{...styles.detailItem, flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none'}}><span style={styles.listItemText}>Görüşme Notları</span><textarea style={{...styles.formInput, textAlign: 'left', marginTop: '10px', minHeight: '80px', color: '#1d1d1f'}} value={newCompany.notes} onChange={e => setNewCompany({...newCompany, notes: e.target.value})} /></div>
              </div>
              <button type="submit" style={{display: 'none'}}></button>
            </form>
          </div>
        )}

        {currentView === 'companyDetail' && selectedCompany && (
          <div className="content-area">
            <div style={styles.pageHeaderNav}>
              <button style={styles.navButton} onClick={() => { if(isEditing) setIsEditing(false); else setCurrentView('companyList'); }}><ArrowLeft size={22} /> <span style={{fontSize: '17px', paddingTop: '1px'}}>{isEditing ? 'Vazgeç' : 'Geri'}</span></button>
              {isEditing ? (<button style={styles.pillButtonSmall} onClick={handleUpdateSubmit} disabled={isSubmitting}><Save size={16} /> {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</button>) : (<button style={styles.navButtonText} onClick={() => { setEditCompany({...selectedCompany}); setIsEditing(true); }}>Düzenle</button>)}
            </div>

            {isEditing && editCompany ? (
              <form onSubmit={handleUpdateSubmit}>
                <h1 style={styles.largeTitle}>Firma Düzenle</h1>
                <h2 style={styles.sectionHeader}>FİRMA BİLGİLERİ</h2>
                <div style={styles.listGroup}>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Firma Adı</span><input style={styles.formInput} required value={editCompany.name} onChange={e => setEditCompany({...editCompany, name: e.target.value})} /></div>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Bölge</span><select style={styles.formSelect} value={editCompany.region} onChange={handleRegionChangeEdit}>{regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select></div>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Ülke</span><select style={styles.formSelect} required value={editCompany.country} onChange={e => setEditCompany({...editCompany, country: e.target.value})}>{availableCountriesEdit.map(c => (<option key={c.en} value={c.tr}>{c.tr}</option>))}</select></div>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Şehir</span><input style={styles.formInput} value={editCompany.city || ''} onChange={e => setEditCompany({...editCompany, city: e.target.value})} /></div>
                  <div style={{...styles.detailItem, borderBottom: 'none'}}><span style={styles.listItemText}>Sektör</span><input style={styles.formInput} value={editCompany.sector} onChange={e => setEditCompany({...editCompany, sector: e.target.value})} /></div>
                </div>
                <h2 style={styles.sectionHeader}>İLETİŞİM BİLGİLERİ</h2>
                <div style={styles.listGroup}>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Yetkili Kişi</span><input style={styles.formInput} value={editCompany.contactName} onChange={e => setEditCompany({...editCompany, contactName: e.target.value})} /></div>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Unvan</span><input style={styles.formInput} value={editCompany.title} onChange={e => setEditCompany({...editCompany, title: e.target.value})} /></div>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Telefon</span><input style={styles.formInput} value={editCompany.phone} onChange={e => setEditCompany({...editCompany, phone: e.target.value})} /></div>
                  <div style={{...styles.detailItem, borderBottom: 'none'}}><span style={styles.listItemText}>E-posta</span><input type="email" style={styles.formInput} value={editCompany.email} onChange={e => setEditCompany({...editCompany, email: e.target.value})} /></div>
                </div>
                <h2 style={styles.sectionHeader}>DURUM VE NOTLAR</h2>
                <div style={styles.listGroup}>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Aşama</span><select style={styles.formSelect} value={editCompany.status} onChange={e => setEditCompany({...editCompany, status: e.target.value})}><option value="İlk Temas">İlk Temas</option><option value="İletişimde">İletişimde</option><option value="Teklif Verildi">Teklif Verildi</option><option value="Müşteri Oldu">Müşteri Oldu</option><option value="Reddedildi">Reddedildi</option></select></div>
                  <div style={{...styles.detailItem, flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none'}}><span style={styles.listItemText}>Görüşme Notları</span><textarea style={{...styles.formInput, textAlign: 'left', marginTop: '10px', minHeight: '80px', color: '#1d1d1f'}} value={editCompany.notes} onChange={e => setEditCompany({...editCompany, notes: e.target.value})} /></div>
                </div>
                <div style={{...styles.listGroup, marginTop: '30px', marginBottom: '20px'}}><div className="hover-item" style={{...styles.listItem, justifyContent: 'center'}} onClick={handleDelete}><span style={{fontSize: '16px', fontWeight: 500, color: '#ff3b30'}}>{isDeleting ? 'Siliniyor...' : 'Firmayı Sil'}</span></div></div>
              </form>
            ) : (
              <>
                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatar}><Building2 size={40} color="#007aff" /></div>
                  <h1 style={{...styles.largeTitle, textAlign: 'center'}}>{selectedCompany.name}</h1>
                  {/* Sektör yazısı kaldırıldı, doğrudan sektör ismi gösteriliyor */}
                  <span style={styles.secondaryText}>{selectedCompany.sector ? `${selectedCompany.sector} • ` : ''}{selectedCompany.city ? `${selectedCompany.city}, ` : ''}{selectedCompany.country}</span>
                </div>
                <h2 style={styles.sectionHeader}>İLETİŞİM BİLGİLERİ</h2>
                <div style={styles.listGroup}>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Yetkili Kişi</span><span style={styles.secondaryText}>{selectedCompany.contactName || '-'} ({selectedCompany.title || '-'})</span></div>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Telefon</span><span style={{...styles.secondaryText, color: '#007aff'}}>{selectedCompany.phone || '-'}</span></div>
                  <div style={{...styles.detailItem, borderBottom: 'none'}}><span style={styles.listItemText}>E-posta</span><span style={{...styles.secondaryText, color: '#007aff'}}>{selectedCompany.email || '-'}</span></div>
                </div>
                <h2 style={styles.sectionHeader}>DURUM VE NOTLAR</h2>
                <div style={styles.listGroup}>
                  <div style={styles.detailItem}><span style={styles.listItemText}>Aşama</span><span style={styles.secondaryText}>{selectedCompany.status}</span></div>
                  <div style={{...styles.detailItem, flexDirection: 'column', alignItems: 'flex-start', padding: '16px 12px', gap: '8px', borderBottom: 'none'}}><span style={styles.listItemText}>Görüşme Notları</span><span style={{color: '#1d1d1f', fontSize: '16px', fontWeight: 300, lineHeight: '1.4'}}>{selectedCompany.notes || '-'}</span></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  sidebarHeader: { padding: '30px 24px 20px 24px', cursor: 'pointer' },
  largeTitle: { fontSize: '32px', fontWeight: 500, letterSpacing: '-0.5px', margin: 0, color: '#1d1d1f' }, 
  searchContainer: { padding: '0 24px 20px 24px' },
  searchBar: { backgroundColor: '#f5f5f7', borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '10px 14px', gap: '8px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#1d1d1f', fontSize: '16px', fontWeight: 300, width: '100%', outline: 'none', fontFamily: 'inherit' },
  regionList: { flex: 1, overflowY: 'auto', padding: '0 12px 20px 12px' },
  listGroup: { display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#fff', borderRadius: '14px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '14px', backgroundColor: 'transparent', cursor: 'pointer' },
  listItemLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  listItemLeftColumn: { display: 'flex', flexDirection: 'column', gap: '4px' },
  listItemText: { fontSize: '16px', fontWeight: 300, color: '#1d1d1f', whiteSpace: 'nowrap' }, 
  subText: { fontSize: '14px', fontWeight: 300, color: '#86868b' }, 
  secondaryText: { fontSize: '16px', fontWeight: 300, color: '#86868b' }, 
  iconSquircle: { width: '32px', height: '32px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  subListGroup: { display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '46px', marginTop: '4px', marginBottom: '8px' },
  subListItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer' },
  detailItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 12px', borderBottom: '1px solid #f0f0f0' },
  formInput: { border: 'none', background: 'transparent', textAlign: 'right', fontSize: '16px', fontWeight: 300, color: '#007aff', outline: 'none', width: '100%', fontFamily: 'inherit' },
  formSelect: { border: 'none', background: 'transparent', direction: 'rtl', fontSize: '16px', fontWeight: 300, color: '#007aff', outline: 'none', width: '100%', fontFamily: 'inherit', appearance: 'none', cursor: 'pointer' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  pageHeaderNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', minHeight: '30px' },
  sectionHeader: { fontSize: '13px', fontWeight: 500, color: '#86868b', marginTop: '40px', marginBottom: '12px', paddingLeft: '12px', letterSpacing: '0.5px' }, 
  
  // YENİ iOS WIDGET STİLLERİ
  iosWidget: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
  iosWidgetLabel: { fontSize: '14px', fontWeight: 500, color: '#86868b' },
  iosWidgetNumber: { fontSize: '38px', fontWeight: 500, margin: 0, color: '#1d1d1f', letterSpacing: '-1px' },

  pillButton: { display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #007aff 0%, #0056b3 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)' },
  pillButtonSmall: { display: 'flex', alignItems: 'center', gap: '4px', background: '#007aff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
  navButton: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'transparent', border: 'none', color: '#007aff', cursor: 'pointer', padding: 0, marginLeft: '-8px', fontFamily: 'inherit', fontWeight: 300 },
  navButtonText: { backgroundColor: 'transparent', border: 'none', color: '#007aff', fontSize: '17px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 300 },
  profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '40px', marginTop: '20px' },
  profileAvatar: { width: '80px', height: '80px', backgroundColor: '#f5f5f7', borderRadius: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }
};