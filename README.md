GEE Data Visualization Platform
Overview
A web-based geospatial data visualization platform that leverages Google Earth Engine (GEE) to provide interactive maps and environmental data analysis. The application offers real-time visualization of various environmental datasets including land cover, cloud coverage, topography, and soil moisture data.
Features

Interactive Map Interface: Built with Leaflet.js for smooth map navigation
Multiple Dataset Support:

Land Cover Analysis
Cloud Cover Detection
Topographical Data
Soil Moisture Levels


Location-Based Analysis:

Automatic IP-based location detection
Manual location input support


Real-time Data Processing: Dynamic data fetching and visualization based on map viewport
Responsive Design: Works across different screen sizes and devices

Prerequisites

Python 3.8+
Google Earth Engine account with authentication credentials
Internet connection for accessing GEE services

Installation

Clone the repository:
bashCopygit clone https://github.com/your-username/gee-visualization-platform.git
cd gee-visualization-platform

Create and activate a virtual environment:
bashCopypython -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

Install required packages:
bashCopypip install -r requirements.txt

Set up Google Earth Engine credentials:

Place your service_account.json file in the project root directory
Update the service_account variable in app.py with your GEE service account email



Configuration

Environment Variables:
Create a .env file in the project root:
CopyFLASK_APP=app.py
FLASK_ENV=development
GEE_SERVICE_ACCOUNT=your-service-account@your-project.iam.gserviceaccount.com

Google Earth Engine Authentication:

Ensure your service account has the necessary permissions in GEE
Verify the path to your credentials JSON file in app.py



Running the Application

Start the Flask server:
bashCopyflask run

Access the application:
Open your web browser and navigate to https://compact-ant-kelvin1001-4ce1f83f.koyeb.app/login?next=%2F

Usage Guide

Initial Setup:

The application will automatically attempt to detect your location
Alternatively, you can manually input coordinates


Viewing Different Datasets:

Use the control buttons below the map to switch between datasets
Available options:

Cloud Cover
Land Use
Topography
Soil Moisture




Map Navigation:

Zoom in/out using mouse wheel or buttons
Pan by clicking and dragging
Double-click location marker to zoom to your position



API Endpoints

GET /: Main application interface
GET /get_ip_location: Retrieves user's location based on IP
POST /get_gee_data: Fetches GEE data based on viewport and selected dataset

Troubleshooting
Common issues and solutions:

No Data Displayed:

Verify GEE credentials are correct
Check console for JavaScript errors
Ensure selected region has available data


Authentication Errors:

Verify service account email in app.py
Check if credentials file is properly placed
Ensure GEE account is active



Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
License
This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgments

Google Earth Engine for providing the geospatial data
Leaflet.js for the mapping interface
Flask framework for the backend implementation

Support
For support, please open an issue in the repository or contact [kelvin.rwihimba@alustudent.com].
Future Improvements

Additional dataset support
Time series analysis
Custom visualization parameters
Data export functionality
User authentication system
