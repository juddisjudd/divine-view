/**
 * Path of Exile API Client
 * https://www.pathofexile.com/developer/docs/reference#itemfilters
 */

export interface PoEFilter {
  id: string;
  filter_name: string;
  realm: 'pc' | 'xbox' | 'sony' | 'poe2';
  description?: string;
  version?: string;
  type?: 'Normal' | 'Ruthless';
  public: boolean;
  filter: string; // The actual filter content
  created_at: string;
  updated_at: string;
}

export interface PoEFilterListResponse {
  filters: PoEFilter[];
}

export interface CreateFilterRequest {
  filter_name: string;
  realm: 'pc' | 'xbox' | 'sony' | 'poe2';
  description?: string;
  version?: string;
  type?: 'Normal' | 'Ruthless';
  public?: boolean;
  filter: string;
}

export interface UpdateFilterRequest {
  filter_name?: string;
  realm?: 'pc' | 'xbox' | 'sony' | 'poe2';
  description?: string;
  version?: string;
  type?: 'Normal' | 'Ruthless';
  public?: boolean;
  filter?: string;
}

export class PoEApiClient {
  private baseUrl = 'https://www.pathofexile.com/api';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DivineView/1.0',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`PoE API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all item filters for the authenticated account
   */
  async getFilters(): Promise<PoEFilterListResponse> {
    return this.request<PoEFilterListResponse>('/item-filter');
  }

  /**
   * Get a specific filter by ID
   */
  async getFilter(filterId: string): Promise<PoEFilter> {
    return this.request<PoEFilter>(`/item-filter/${filterId}`);
  }

  /**
   * Create a new item filter
   */
  async createFilter(filterData: CreateFilterRequest): Promise<PoEFilter> {
    return this.request<PoEFilter>('/item-filter', {
      method: 'POST',
      body: JSON.stringify(filterData),
    });
  }

  /**
   * Update an existing filter
   */
  async updateFilter(filterId: string, filterData: UpdateFilterRequest): Promise<PoEFilter> {
    return this.request<PoEFilter>(`/item-filter/${filterId}`, {
      method: 'POST',
      body: JSON.stringify(filterData),
    });
  }


  /**
   * Upload filter content directly to PoE
   */
  async syncFilterToPoE(filterName: string, filterContent: string, options: {
    realm?: 'pc' | 'xbox' | 'sony' | 'poe2';
    description?: string;
    version?: string;
    type?: 'Normal' | 'Ruthless';
    public?: boolean;
    updateExisting?: boolean;
  } = {}): Promise<PoEFilter> {
    const {
      realm = 'poe2',
      description = '',
      version,
      type,
      public: isPublic = false,
      updateExisting = true
    } = options;

    // First, try to find an existing filter with the same name
    if (updateExisting) {
      try {
        const existingFilters = await this.getFilters();
        const existingFilter = existingFilters.filters.find(f => f.filter_name === filterName);
        
        if (existingFilter) {
          return this.updateFilter(existingFilter.id, {
            filter: filterContent,
            realm,
            description,
            version,
            type,
            public: isPublic,
          });
        }
      } catch (error) {
        console.warn('Could not check for existing filters:', error);
      }
    }

    // Create new filter
    return this.createFilter({
      filter_name: filterName,
      realm,
      description,
      version,
      type,
      public: isPublic,
      filter: filterContent,
    });
  }
}