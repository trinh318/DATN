// faiss.js
const faiss = require('faiss-node');
const natural = require('natural');
const TfIdf = natural.TfIdf;

class FaissService {
  constructor() {
    this.index = null;
    this.tfidf = new TfIdf();
    this.jobIds = [];
    this.vocabulary = new Set();
    this.dimension = 0;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('FAISS already initialized. Skipping...');
        return true;
      }

      // Initialize with a small dimension first, will be updated when adding vectors
      this.dimension = 1;
      this.index = new faiss.IndexFlatL2(this.dimension);
      this.isInitialized = true;
      console.log('FAISS index initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize FAISS index:', error);
      return false;
    }
  }

  async addJobVectors(jobs) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
        console.warn('No jobs provided to add to FAISS index');
        return false;
      }

      console.log(`Processing ${jobs.length} jobs for indexing...`);

      // Reset data
      this.jobIds = [];
      this.tfidf = new TfIdf();
      this.vocabulary = new Set();

      // First pass: build vocabulary
      jobs.forEach(job => {
        if (!job || !job._id) {
          //console.warn('Invalid job object, skipping:', job);
          return;
        }
        const jobText = this._processJobText(job);
        console.log(`Processing job ${job._id}:`, {
          title: job.title,
          textLength: jobText.length
        });
        this.tfidf.addDocument(jobText);
        this.jobIds.push(job._id.toString());
      });

      console.log('Jobs added to FAISS index:', this.jobIds);
      console.log(`Total jobs processed: ${this.jobIds.length}`);

      // Build vocabulary
      for (let i = 0; i < this.tfidf.documents.length; i++) {
        const terms = this.tfidf.listTerms(i);
        terms.forEach(({ term }) => this.vocabulary.add(term));
      }

      // Update dimension based on vocabulary size
      this.dimension = this.vocabulary.size;
      //console.log(`Vocabulary size: ${this.dimension}`);
      //console.log('Vocabulary terms:', Array.from(this.vocabulary));

      // Create new index with correct dimension
      this.index = new faiss.IndexFlatL2(this.dimension);

      // Generate vectors
      const vectors = this._generateVectors();
      //console.log(`Generated ${vectors.length} vectors of dimension ${this.dimension}`);
      //console.log('First vector sample:', vectors[0]?.slice(0, 5));

      if (vectors.length > 0) {
        // Convert vectors to proper format for FAISS
        const normalizedVectors = vectors.map(vector => {
          // Ensure vector is the correct length
          const normalizedVector = new Array(this.dimension).fill(0);
          for (let i = 0; i < Math.min(vector.length, this.dimension); i++) {
            normalizedVector[i] = vector[i];
          }
          return normalizedVector;
        });

        // Create a single flat array of all vectors
        const flattenedVectors = [];
        normalizedVectors.forEach(vector => {
          flattenedVectors.push(...vector);
        });

        console.log(`Flattened vector length: ${flattenedVectors.length}`);
        console.log(`Vector type: ${flattenedVectors.constructor.name}`);
        console.log(`First few values: ${flattenedVectors.slice(0, 5)}`);
        
        // Add vectors to index
        await this.index.add(flattenedVectors);
        console.log(`Added ${vectors.length} job vectors to FAISS index`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error adding job vectors:', error);
      console.error('Error details:', error.message);
      return false;
    }
  }

  async searchSimilarJobs(userProfile, numResults = 10) {
    try {
      if (!this.isInitialized || !this.index) {
        console.error('FAISS not initialized');
        return [];
      }

      if (this.jobIds.length === 0) {
        console.warn('No jobs indexed');
        return [];
      }

      console.log(`Total jobs in index: ${this.jobIds.length}`);
      console.log('Indexed job IDs:', this.jobIds);

      // Create user vector
      const userVector = this._createUserVector(userProfile);
      if (!userVector || userVector.length !== this.dimension) {
        console.error(`Invalid user vector. Expected length ${this.dimension}, got ${userVector?.length}`);
        return [];
      }

      // Ensure we don't request more results than available jobs
      const k = Math.min(numResults, this.jobIds.length);
      if (k <= 0) {
        console.warn('No results requested or no jobs indexed');
        return [];
      }

      console.log(`Searching for top ${k} job recommendations...`);

      // Create the search array with the correct format
      const searchVector = userVector.flat();
      console.log(`Search vector length: ${searchVector.length}`);
      console.log(`First few values: ${searchVector.slice(0, 5)}`);

      // Search
      const result = await this.index.search(searchVector, k);
      console.log('Search result:', result);
      
      if (!result || !result.labels || !result.distances) {
        console.error('Invalid search result format');
        return [];
      }

      // Handle the result format
      const labels = Array.isArray(result.labels) ? result.labels : [result.labels];
      const distances = Array.isArray(result.distances) ? result.distances : [result.distances];

      console.log('Search labels:', labels);
      console.log('Search distances:', distances);

      // Map results and sort by similarity
      const recommendations = [];
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const distance = distances[i];
        if (label !== undefined && distance !== undefined) {
          const similarity = 1 / (1 + distance);
          recommendations.push({
            jobId: this.jobIds[label],
            similarity: similarity,
            rank: i + 1
          });
        }
      }

      // Sort by similarity in descending order
      recommendations.sort((a, b) => b.similarity - a.similarity);

      console.log(`Found ${recommendations.length} job recommendations`);
      console.log('Top recommendations:', recommendations.slice(0, 3));
      
      return recommendations;

    } catch (error) {
      console.error('Error in searchSimilarJobs:', error);
      console.error('Error details:', error.message);
      return [];
    }
  }

  _processJobText(job) {
    return [
      job.description || '',
      (job.skills && Array.isArray(job.skills) ? job.skills.join(' ') : ''),
      job.title || '',
      job.requirements || '',
      job.qualifications || '',
      job.location || '',
      job.benefits || ''
    ].filter(Boolean).join(' ').toLowerCase();
  }

  _createUserVector(profile) {
    try {
      if (!profile) return new Array(this.dimension).fill(0);

      // Enhanced user profile processing
      const userText = [
        // Skills (weighted higher)
        ...(profile.skills && Array.isArray(profile.skills) ? profile.skills.map(skill => skill + ' ' + skill) : []),
        // Job title (weighted higher)
        profile.job_title ? profile.job_title + ' ' + profile.job_title : '',
        // Desired work location
        profile.desired_work_location || '',
        // Current industry
        profile.current_industry || '',
        // Job level
        profile.job_level || '',
        // Current field
        profile.current_field || '',
        // Education
        profile.education || '',
        // Experience (weighted)
        ...(profile.experience && Array.isArray(profile.experience) ? profile.experience.map(exp => exp + ' ' + exp) : []),
        // Location
        profile.location || '',
        // Degrees
        ...(profile.degrees && Array.isArray(profile.degrees) ? profile.degrees : []),
        // Detailed experience
        profile.detailedExperience || ''
      ].filter(Boolean).join(' ').toLowerCase();

      // Create vector with correct dimension
      const vector = new Array(this.dimension).fill(0);
      const terms = this.tfidf.tfidfs(userText);
      
      // Map terms to vector positions with enhanced weighting
      const vocabularyArray = Array.from(this.vocabulary);
      terms.forEach((score, i) => {
        if (i < this.dimension) {
          // Apply additional weighting to important terms
          const term = vocabularyArray[i];
          let weight = 1.0;
          
          // Increase weight for skills and job titles
          if (profile.skills && profile.skills.some(skill => term.includes(skill.toLowerCase()))) {
            weight = 1.5;
          }
          if (profile.job_title && term.includes(profile.job_title.toLowerCase())) {
            weight = 1.5;
          }
          
          vector[i] = score * weight;
        }
      });

      return vector;
    } catch (error) {
      console.error('Error creating user vector:', error);
      return new Array(this.dimension).fill(0);
    }
  }

  _generateVectors() {
    try {
      const vectors = [];
      const vocabularyArray = Array.from(this.vocabulary);

      for (let i = 0; i < this.tfidf.documents.length; i++) {
        const vector = new Array(this.dimension).fill(0);
        const terms = this.tfidf.listTerms(i);

        terms.forEach(({ term, tfidf }) => {
          const idx = vocabularyArray.indexOf(term);
          if (idx !== -1) {
            vector[idx] = tfidf;
          }
        });

        vectors.push(vector);
      }

      return vectors;
    } catch (error) {
      console.error('Error generating vectors:', error);
      return [];
    }
  }
}

module.exports = new FaissService();
