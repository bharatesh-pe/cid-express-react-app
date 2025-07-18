import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Formbuilder from './pages/FormBuilder';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import CreateProfile from './pages/CreateProfile';
import ProfileView from './pages/ProfileView';
import ViewTemplate from './pages/viewTemplate';
import ProfileData from './pages/profileData';
import GenerateProfilePdf from './pages/GenerateProfilePdf';
import UserManagement from './pages/UserManagement';
import EQCases from "./pages/cases/EQCases";
import EQView from "./pages/cases/EQView";
import EnquiryCase from "./pages/cases/EnquiryCase";
import PTView from "./pages/cases/PTView";
import PTCase from "./pages/cases/PTCases"
import PTCreate from "./pages/cases/PTCreate"
import Repository from "./pages/repository/repository";
import Circular from './pages/Circular';
import GovernmentOrder from './pages/Governmentorder';
import Judgement from './pages/Judgement';
import Report from "./pages/reports";
import UICreate from './pages/cases/UICreate';
import UICases from './pages/cases/UICases';
import RolePage from './pages/Role';
import OrdersRepository from './pages/repository'
import UIView from './pages/cases/UIView';
import Trail from './pages/trail';
import Annexure from './pages/annexure'
import { AuthProvider } from "./context/AuthContext";
import SessionTimeoutHandler from './components/SessionTimeoutHandler';

import UnderInvestigation from './pages/UnderInvestigation';
import PendingTrail from './pages/PendingTrail';
import Enquiries from './pages/Enquiries';
import CDRPage from './pages/cdrpage';
import CrimeIntelligence from './pages/CrimeIntelligence';
import MastersView from './pages/Masters';
import Designation from './pages/designation';
import KGID from './pages/kgid';
import Department from './pages/department';
import Division from './pages/division';
import Approval from './pages/approval';
import Hierarchy from './pages/hierarchy';
import Act from './pages/act';
import Section from './pages/section';
import CaseActions from './pages/CaseAction';
import TemplateMastersView from './pages/templateMasters';
import LokayuktaView from './pages/lokayuktaView';
import ActionPlan from './pages/ActionPlan';
import IframePage from './pages/IframePage';
import SettingsPage from './pages/SettingsPage';
import ImportOldData from './pages/ImportOldData';
import MagazineView from './pages/MagazineView';
import VideoListViewer from './pages/HelpVideos'

import { ToastContainer } from 'react-toastify';
function App() {
//   const { isAdmin } = useAuth ? useAuth() : { isAdmin: false };
  return (
    <Router>
      <AuthProvider>
        <SessionTimeoutHandler />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/repository/circular"
            element={
              <ProtectedRoute>
                <Layout>
                  <Circular />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/repository/gn_order"
            element={
              <ProtectedRoute>
                <Layout>
                  <GovernmentOrder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
          path="/repository/judgements"
          element={
            <ProtectedRoute>
              <Layout>
                <Judgement />
              </Layout>
            </ProtectedRoute>
          }
        />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Report />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trail"
            element={
              <ProtectedRoute>
                <Layout>
                  <Trail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/annexure"
            element={
              <ProtectedRoute>
                <Layout>
                  <Annexure />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/UICreate"
            element={
              <ProtectedRoute>
                <Layout>
                  <UICreate />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/UIView"
            element={
              <ProtectedRoute>
                <Layout>
                  <UIView />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/UICases"
            element={
              <ProtectedRoute>
                <Layout>
                  <UICases />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/EQCases"
            element={
              <ProtectedRoute>
                <Layout>
                  <EQCases />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/EQView"
            element={
              <ProtectedRoute>
                <Layout>
                  <EQView />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/EnquiryCase"
            element={
              <ProtectedRoute>
                <Layout>
                  <EnquiryCase />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/PTView"
            element={
              <ProtectedRoute>
                <Layout>
                  <PTView />
                </Layout>
              </ProtectedRoute>
            }
          />
         <Route
            path="/PTCreate"
            element={
              <ProtectedRoute>
                <Layout>
                  <PTCreate />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/PTCase"
            element={
              <ProtectedRoute>
                <Layout>
                  <PTCase />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user_management"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

            <Route
                path="/case/ui_case"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <UnderInvestigation />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/videos"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <VideoListViewer />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/case/pt_case"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <PendingTrail />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/case/enquiry"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Enquiries />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/case/cdr_case"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CDRPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/case/ci_case"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CrimeIntelligence />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/case/repos_case"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <OrdersRepository />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/master"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <MastersView />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/templatemaster"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <TemplateMastersView />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/master/designation"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Designation />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/master/kgid"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <KGID />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/master/department"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Department />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/master/division"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Division />
                        </Layout>
                    </ProtectedRoute>
                }
            />
             <Route
                path="/master/approval"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Approval />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/master/hierarchy"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Hierarchy />
                        </Layout>
                    </ProtectedRoute>
                }
            />
             <Route
                path="/master/act"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Act />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/master/section"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Section />
                        </Layout>
                    </ProtectedRoute>
                }
            />
          <Route
            path="/create-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formbuilder"
            element={
              <ProtectedRoute>
                <Layout>
                  <Formbuilder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-view"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfileView />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewTemplate"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewTemplate />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-data"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfileData />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-pdf"
            element={
              <ProtectedRoute>
                <Layout>
                  <GenerateProfilePdf />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/role"
            element={
              <ProtectedRoute>
                <Layout>
                  <RolePage />
                </Layout>
              </ProtectedRoute>
            }
          />
            <Route
                path="/caseAction"
                element={
                <ProtectedRoute>
                    <Layout>
                    <CaseActions />
                    </Layout>
                </ProtectedRoute>
                }
            />
            
            <Route
                path="/caseview"
                element={
                <ProtectedRoute>
                    {/* <Layout> */}
                        <LokayuktaView />
                    {/* </Layout> */}
                </ProtectedRoute>
                }
            />

            <Route
                path="/magazine-view"
                element={
                    <ProtectedRoute>
                        <MagazineView />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/action_plan"
                element={
                <ProtectedRoute>
                    {/* <Layout> */}
                        <ActionPlan />
                    {/* </Layout> */}
                </ProtectedRoute>
                }
            />

            <Route
                path="/iframe"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <IframePage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <SettingsPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            {/* {isAdmin && ( */}
              <Route
                path="/importDB"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ImportOldData />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            {/* )} */}

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
}

export default App;
