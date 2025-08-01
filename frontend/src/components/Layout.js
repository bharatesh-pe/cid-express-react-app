// Layout.js
import React, { useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Stack,
  ListItemIcon,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  TextField,
} from "@mui/material";

import { ExpandLess, ExpandMore } from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
// import { Outlet } from 'react-router-dom';
import LogoImg from "../Images/siimsLogo.png";
import LogoText from "../Images/cid_logo.png";
import adminSidebarMenu from "./sidebar/admin.json";
import userSidebarMenu from "./sidebar/user.json";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userImg from "../Images/userImg.png";
import Navbar from "./navbar";
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';

import video1 from "../videos/UI_Introduction.mp4"
import video2 from "../videos/UI_All_Cases.mp4"
import video3 from "../videos/UI_FIR Form.mp4"
import api from "../services/api";

const icons = {
  dashboard: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 17.5H5.16667C4.23325 17.5 3.76654 17.5 3.41002 17.3183C3.09641 17.1586 2.84144 16.9036 2.68166 16.59C2.5 16.2335 2.5 15.7668 2.5 14.8333V2.5M5.83333 8.75V14.5833M9.58333 4.58333V14.5833M13.3333 8.75V14.5833M17.0833 4.58333V14.5833"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  user_mgnt: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.6668 17.5V15.8333C16.6668 14.9493 16.3156 14.1014 15.6905 13.4763C15.0654 12.8512 14.2176 12.5 13.3335 12.5H6.66683C5.78277 12.5 4.93493 12.8512 4.30981 13.4763C3.68469 14.1014 3.3335 14.9493 3.3335 15.8333V17.5M13.3335 5.83333C13.3335 7.67428 11.8411 9.16667 10.0002 9.16667C8.15921 9.16667 6.66683 7.67428 6.66683 5.83333C6.66683 3.99238 8.15921 2.5 10.0002 2.5C11.8411 2.5 13.3335 3.99238 13.3335 5.83333Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  template: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.66667 12.5V14.1667M10 9.16667V14.1667M13.3333 5.83333V14.1667M6.5 17.5H13.5C14.9001 17.5 15.6002 17.5 16.135 17.2275C16.6054 16.9878 16.9878 16.6054 17.2275 16.135C17.5 15.6002 17.5 14.9001 17.5 13.5V6.5C17.5 5.09987 17.5 4.3998 17.2275 3.86502C16.9878 3.39462 16.6054 3.01217 16.135 2.77248C15.6002 2.5 14.9001 2.5 13.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  masters: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.08317 9.99992H4.90148C5.47248 9.99992 5.99448 10.3225 6.24984 10.8333C6.5052 11.344 7.02719 11.6666 7.5982 11.6666H12.4015C12.9725 11.6666 13.4945 11.344 13.7498 10.8333C14.0052 10.3225 14.5272 9.99992 15.0982 9.99992H17.9165M7.47197 3.33325H12.5277C13.4251 3.33325 13.8738 3.33325 14.2699 3.46989C14.6202 3.59072 14.9393 3.78792 15.204 4.04721C15.5034 4.34042 15.7041 4.74175 16.1054 5.5444L17.9109 9.15534C18.0684 9.47032 18.1471 9.62782 18.2027 9.79287C18.252 9.93946 18.2876 10.0903 18.309 10.2435C18.3332 10.4159 18.3332 10.592 18.3332 10.9442V12.6666C18.3332 14.0667 18.3332 14.7668 18.0607 15.3016C17.821 15.772 17.4386 16.1544 16.9681 16.3941C16.4334 16.6666 15.7333 16.6666 14.3332 16.6666H5.6665C4.26637 16.6666 3.56631 16.6666 3.03153 16.3941C2.56112 16.1544 2.17867 15.772 1.93899 15.3016C1.6665 14.7668 1.6665 14.0667 1.6665 12.6666V10.9442C1.6665 10.592 1.6665 10.4159 1.69065 10.2435C1.71209 10.0903 1.7477 9.93946 1.79702 9.79287C1.85255 9.62782 1.9313 9.47032 2.0888 9.15534L3.89426 5.5444C4.29559 4.74174 4.49625 4.34042 4.79562 4.04721C5.06036 3.78792 5.37943 3.59072 5.72974 3.46989C6.12588 3.33325 6.57458 3.33325 7.47197 3.33325Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  circular: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_1120_40227)">
        <path
          d="M18.2671 11.0542C18.3107 10.709 18.3332 10.3572 18.3332 10.0001C18.3332 5.39771 14.6022 1.66675 9.99984 1.66675C5.39746 1.66675 1.6665 5.39771 1.6665 10.0001C1.6665 14.6025 5.39746 18.3334 9.99984 18.3334C10.3627 18.3334 10.7201 18.3102 11.0707 18.2652M9.99984 5.00008V10.0001L13.1151 11.5577M15.8332 18.3334V13.3334M13.3332 15.8334H18.3332"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1120_40227">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  judgements: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6668 1.8913V5.33342C11.6668 5.80013 11.6668 6.03348 11.7577 6.21174C11.8376 6.36854 11.965 6.49603 12.1218 6.57592C12.3001 6.66675 12.5335 6.66675 13.0002 6.66675H16.4423M16.6668 8.3236V14.3334C16.6668 15.7335 16.6668 16.4336 16.3943 16.9684C16.1547 17.4388 15.7722 17.8212 15.3018 18.0609C14.767 18.3334 14.067 18.3334 12.6668 18.3334H7.3335C5.93336 18.3334 5.2333 18.3334 4.69852 18.0609C4.22811 17.8212 3.84566 17.4388 3.60598 16.9684C3.3335 16.4336 3.3335 15.7335 3.3335 14.3334V5.66675C3.3335 4.26662 3.3335 3.56655 3.60598 3.03177C3.84566 2.56137 4.22811 2.17892 4.69852 1.93923C5.2333 1.66675 5.93336 1.66675 7.3335 1.66675H10.01C10.6215 1.66675 10.9272 1.66675 11.2149 1.73582C11.47 1.79707 11.7139 1.89808 11.9375 2.03515C12.1898 2.18975 12.406 2.40594 12.8384 2.83832L15.4953 5.49517C15.9276 5.92755 16.1438 6.14374 16.2984 6.39604C16.4355 6.61972 16.5365 6.86358 16.5978 7.11867C16.6668 7.40639 16.6668 7.71213 16.6668 8.3236Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  gn_order: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.75036 10.0001H4.16702M4.09648 10.243L2.15071 16.0552C1.99785 16.5119 1.92142 16.7402 1.97627 16.8808C2.0239 17.0029 2.1262 17.0954 2.25244 17.1307C2.3978 17.1712 2.61736 17.0724 3.05647 16.8748L16.9827 10.608C17.4113 10.4151 17.6256 10.3187 17.6918 10.1847C17.7494 10.0684 17.7494 9.93179 17.6918 9.8154C17.6256 9.68143 17.4113 9.585 16.9827 9.39212L3.05161 3.12317C2.61383 2.92617 2.39493 2.82767 2.24971 2.86807C2.1236 2.90317 2.0213 2.99549 1.97351 3.11736C1.91847 3.25769 1.99408 3.4855 2.14531 3.94113L4.09702 9.82134C4.12299 9.8996 4.13598 9.93873 4.14111 9.97874C4.14565 10.0143 4.14561 10.0502 4.14097 10.0857C4.13574 10.1257 4.12265 10.1648 4.09648 10.243Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  case: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.99984 17.5L9.91646 17.3749C9.33759 16.5066 9.04816 16.0725 8.66576 15.7582C8.32722 15.4799 7.93714 15.2712 7.51784 15.1438C7.04421 15 6.52243 15 5.47886 15H4.33317C3.39975 15 2.93304 15 2.57652 14.8183C2.26292 14.6586 2.00795 14.4036 1.84816 14.09C1.6665 13.7335 1.6665 13.2668 1.6665 12.3333V5.16667C1.6665 4.23325 1.6665 3.76654 1.84816 3.41002C2.00795 3.09641 2.26292 2.84144 2.57652 2.68166C2.93304 2.5 3.39975 2.5 4.33317 2.5H4.6665C6.53335 2.5 7.46677 2.5 8.17981 2.86331C8.80701 3.18289 9.31695 3.69282 9.63653 4.32003C9.99984 5.03307 9.99984 5.96649 9.99984 7.83333M9.99984 17.5V7.83333M9.99984 17.5L10.0832 17.3749C10.6621 16.5066 10.9515 16.0725 11.3339 15.7582C11.6725 15.4799 12.0625 15.2712 12.4818 15.1438C12.9555 15 13.4772 15 14.5208 15H15.6665C16.5999 15 17.0666 15 17.4232 14.8183C17.7368 14.6586 17.9917 14.4036 18.1515 14.09C18.3332 13.7335 18.3332 13.2668 18.3332 12.3333V5.16667C18.3332 4.23325 18.3332 3.76654 18.1515 3.41002C17.9917 3.09641 17.7368 2.84144 17.4232 2.68166C17.0666 2.5 16.5999 2.5 15.6665 2.5H15.3332C13.4663 2.5 12.5329 2.5 11.8199 2.86331C11.1927 3.18289 10.6827 3.69282 10.3631 4.32003C9.99984 5.03307 9.99984 5.96649 9.99984 7.83333"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { navbarKey } = location.state || {}

  const userName = localStorage.getItem("username");
  const designationName = localStorage.getItem("designation_name");
  const [sidebarMenusObj, setSidebarMenusObj] = useState([]);

  // for dropdowmn sidebars
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);

  const [loading, setLoading] = useState(false); // State for loading indicator

    const [videoOpen, setVideoOpen] = useState(false);

    const [videos, setVideos] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    const REACT_APP_SERVER_URL_FILE_VIEW = process.env.REACT_APP_SERVER_URL_FILE_VIEW;

    const handleVideoOpen = async ()=>{

        const pathname = window.location.pathname;
        const segments = pathname.split('/').filter(Boolean);
        const lastPath = segments[segments.length - 1];

        const payload = {
            data : [lastPath]
        }

        try {
            setLoading(true);

            const getAllVideosResponse = await api.post("/templateData/gettingAllHelpVideos", payload);
            setLoading(false);

            if (getAllVideosResponse && getAllVideosResponse.data && getAllVideosResponse.success) {

                setVideos(getAllVideosResponse.data);
                setVideoOpen(true);
            
            } else {
                setVideos({});
                const errorMessage = getAllVideosResponse?.data?.message || "Failed to get help videos.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error",
                });
            }

        } catch (error) {
            setVideos({});
            setLoading(false);

            toast.error(error?.response?.data?.message || "Please Try Again!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error",
            });
        }
    }

    const handleVideoClose = () => setVideoOpen(false);

    const [userOverallDesignation, setUserOverallDesignation] = useState(localStorage.getItem("userOverallDesignation") ? JSON.parse(localStorage.getItem("userOverallDesignation")) : []);
    const [openUserDesignationDropdown, setOpenUserDesignationDropdown] = useState(false);


    const isCDR = localStorage.getItem("designation_name") === "CDR" ? true : false;
        
    const allTabs = [
        { label: "UI Module", route: "/case/ui_case", key: "ui_case" },
        {   label: "Court Module", 
            route: "/case/pt_case", 
            key: "pt_case",
            options : [
                {label: "Trial Courts", route: "/case/pt_case", key: "pt_trail_case", actionKey: "pt_trail_case"},
                {label: "Other Courts", route: "/case/pt_case", key: "pt_other_case", actionKey: "pt_other_case"},
            ]
        },
        { label: "Crime Intelligence", route: "/case/ci_case", key: "crime_intelligence" },
        { label: "Enquiries", route: "/case/enquiry", key: "eq_case" },
        { label: "Crime Analytics", route: "/iframe", key: "crime_analytics" },
        { label: "Orders & Repository", route: "/case/repos_case", key: "repos_case" },
        // { 
        //     label: "Orders & Circulars", 
        //     route: "/repository/judgements", 
        //     key: "order_circulars",
        //     options : [
        //         {label: "Goverment Order", route: "/repository/gn_order", key: "gn_order", directLoad : true},
        //         {label: "Judgement", route: "/repository/judgements", key: "judgements", directLoad : true},
        //         {label: "Circular", route: "/repository/circular", key: "circular", directLoad : true},
        //     ]
        // },
    ];

    const userPermissions = localStorage.getItem("user_permissions") ? JSON.parse(localStorage.getItem("user_permissions")) : {};
    const sortedTabs = [];

    if(userPermissions?.[0]){
        const permissionObj = userPermissions?.[0];

        if(permissionObj?.ui_case === true){
            sortedTabs.push(
                { label: "UI Module", route: "/case/ui_case", key: "ui_case", name: "UI Case" }
            )
        }

        if(permissionObj?.pt_case === true){
            sortedTabs.push(
                {   
                    label: "Court Module", 
                    route: "/case/pt_case", 
                    key: "pt_case",
                    options : [
                        {label: "Trial Courts", route: "/case/pt_case", key: "pt_trail_case", actionKey: "pt_trail_case", name: "PT Case"},
                        {label: "Other Courts", route: "/case/pt_case", key: "pt_other_case", actionKey: "pt_other_case", name: "PT Case"},
                    ]
                }
            )
        }

        if(permissionObj?.crime_intelligence === true){
            sortedTabs.push(
                { label: "Crime Intelligence", route: "/case/ci_case", key: "crime_intelligence" }
            )
        }
        
        if(permissionObj?.enquiry === true){
            sortedTabs.push(
                { label: "Enquiries", route: "/case/enquiry", key: "eq_case", name: "Enquiries" }
            )
        }
        
        if(permissionObj?.crime_analytics === true){
            sortedTabs.push(
                { label: "Crime Analytics", route: "/iframe", key: "crime_analytics" }
            )
        }

        if(permissionObj?.repos_case === true){
            sortedTabs.push(
                { label: "Orders & Repository", route: "/case/repos_case", key: "repos_case" }
            )
        }

    }

    const tabLabels = isCDR ? [{ label: "CDR", route: "/case/cdr_case", key: "ui_case" }] : sortedTabs;

    const selectedTab = useRef(tabLabels?.[0]);
    const selectedActiveKey = useRef(tabLabels?.[0]?.key);

    const gettingTabKey = navbarKey || localStorage.getItem("navbarKey") || null;
    
    if(gettingTabKey){
        localStorage.setItem("navbarKey", gettingTabKey);

        tabLabels.forEach((tab) => {
            const isMainMatch = gettingTabKey === tab.key;
            
            const matchedOption = tab.options?.find(
                (opt) => (opt?.actionKey ?? opt?.key) === gettingTabKey
            );

            if (isMainMatch) {
                selectedTab.current = tab;
                selectedActiveKey.current = tab.key;
            } else if (matchedOption) {
                selectedTab.current = matchedOption;
                selectedActiveKey.current = matchedOption.key;
            }
        });
    }

    const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
    const [submenuItems, setSubmenuItems] = useState([]);
    const [selectedSubKey, setSelectedSubKey] = useState("");    
    const handleTabClick = (event, tab) => {

        if(tab.key === "crime_analytics" || tab.key === "crime_intelligence" || tab.key === "repos_case"){
            navigate(tab?.route, {state: {"navbarKey" : tab.key}});
            window.location.reload();
            return;
        }

        selectedTab.current = tab
        if (tab.options) {
            setSubmenuAnchorEl(event.currentTarget);
            setSubmenuItems(tab.options);
        }else{
            selectedActiveKey.current = tab.key
            navigateTabs();
        }
    };

    const handleMenuItemClick = (option) => {
        selectedTab.current = option
        selectedActiveKey.current = option.key
        navigateTabs();
    };

    const handleMenuClose = () => {
        setSubmenuAnchorEl(null);
    };

    const navigateTabs = ()=>{

        handleMenuClose();

        if(selectedTab?.current?.directLoad){
            navigate(selectedTab?.current?.route);
            return;
        }

        navigate("/dashboard", {state : {tabActiveKey: selectedActiveKey.current }});
    }

  // for toggle sidebar dropdowns
  const handleDropdownToggle = (index) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleMenuClick = async () => {
    setLoading(true);
    try {
        var user_designation_id = localStorage.getItem("designation_id") || "";
        var user_division_id = localStorage.getItem("division_id") || "0";
        var user_designation_id =localStorage.getItem("designation_id") || "0";
        var user_designation_name = localStorage.getItem("designation_name") || "";
        var user_id = localStorage.getItem("user_id") || "0";
        const token = localStorage.getItem("auth_token");
        const serverURL = process.env.REACT_APP_SERVER_URL;

        const response = await fetch(`${serverURL}/auth/get_supervisor_id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({
            designation_id: user_designation_id,
            designation_name: user_designation_name,
            division_id: user_division_id,
            user_id: user_id,

          }),
        });
        setLoading(false);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        if (data && data.success && data.getDataBasesOnUsers) {
            localStorage.setItem("allowedUserIds",JSON.stringify(data.allowedUserIds));
            localStorage.setItem("allowedDepartmentIds",JSON.stringify(data.allowedDepartmentIds));
            localStorage.setItem("allowedDivisionIds",JSON.stringify(data.allowedDivisionIds));
            localStorage.setItem("getDataBasesOnUsers",JSON.stringify(data.getDataBasesOnUsers));
        }  
        else
        {
            localStorage.setItem("allowedUserIds",JSON.stringify(data.allowedUserIds));
            localStorage.setItem("getDataBasesOnUsers",JSON.stringify(data.getDataBasesOnUsers));
        } 

      } catch (err) {
        setLoading(false);
        var errMessage = "Something went wrong. Please try again.";
        if (err && err.message) {
          errMessage = err.message;
        }

        toast.error(errMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-warning",
        });
        return;
      }
  }

  useEffect(() => {
    const ApprunCall = async () => {
      setLoading(true);
      try {
        var user_designation_id = localStorage.getItem("designation_id") || "";
        var user_division_id = localStorage.getItem("division_id") || "0";
        const token = localStorage.getItem("auth_token");
        const serverURL = process.env.REACT_APP_SERVER_URL;

        const response = await fetch(`${serverURL}/auth/get_module`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({
            user_designation_id: user_designation_id,
            user_division_id: user_division_id,
          }),
        });
        setLoading(false);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        if (data && data.success && data["modules"]) {
          setSidebarMenusObj(data["modules"]);
        }

        if (data && data.success && data.unreadNotificationCount !== null && data.unreadNotificationCount !== undefined) {
            setNotificationCount(data.unreadNotificationCount);
            localStorage.setItem("unreadNotificationCount",data.unreadNotificationCount);
        } else {
            setNotificationCount(0);
        }        

      } catch (err) {
        setLoading(false);
        var errMessage = "Something went wrong. Please try again.";
        if (err && err.message) {
          errMessage = err.message;
        }
        if (errMessage) {
          // errMessage = await errMessage.json();
          if (errMessage && errMessage.includes("Authorization_error")) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("username");
            localStorage.removeItem("authAdmin");
            localStorage.removeItem("kgid");
            localStorage.removeItem("user_permissions");
            localStorage.removeItem("designation_id");
            localStorage.removeItem("designation_name");
            localStorage.removeItem("allowedUserIds");
            localStorage.removeItem("getDataBasesOnUsers");
            localStorage.removeItem("allowedDepartmentIds");
            localStorage.removeItem("allowedDivisionIds");
            localStorage.removeItem("role_id");
            localStorage.removeItem("role_title");
            navigate("/");
          }
        }
        toast.error(errMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-warning",
        });
        return;
      }
    };
    ApprunCall();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    setLoading(true);

    try {
      const serverURL = process.env.REACT_APP_SERVER_URL;
      const response = await fetch(`${serverURL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
        setLoading(false);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("username");
        localStorage.removeItem("authAdmin");
        localStorage.removeItem("kgid");
        localStorage.removeItem("user_permissions");
        localStorage.removeItem("designation_id");
        localStorage.removeItem("designation_name");
        localStorage.removeItem("user_id");
        localStorage.removeItem("division_id");
        localStorage.removeItem("division_name");
        localStorage.removeItem("allowedUserIds");
        localStorage.removeItem("getDataBasesOnUsers");
        localStorage.removeItem("allowedDepartmentIds");
        localStorage.removeItem("allowedDivisionIds");
        localStorage.removeItem("role_id");
        localStorage.removeItem("role_title");
      navigate("/");
    } catch (err) {
      var errMessage = "Something went wrong. Please try again.";
      if (err && err.message) {
        errMessage = err.message;
      }

      if (errMessage) {
        // errMessage = await errMessage.json();
        if (errMessage && errMessage.includes("Authorization_error")) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("username");
            localStorage.removeItem("authAdmin");
            localStorage.removeItem("kgid");
            localStorage.removeItem("user_permissions");
            localStorage.removeItem("designation_id");
            localStorage.removeItem("designation_name");
            localStorage.removeItem("allowedUserIds");
            localStorage.removeItem("getDataBasesOnUsers");
            localStorage.removeItem("allowedDepartmentIds");
            localStorage.removeItem("allowedDivisionIds");
            localStorage.removeItem("role_id");
            localStorage.removeItem("role_title");
          navigate("/");
        }
      }

      toast.error(errMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "toast-warning",
      });
      return;
    }
    finally {
        setLoading(false);
    }
  };

  const isCDRPage = localStorage.getItem("designation_name") === "CDR" ? true : false;

  useEffect(() => {
    if (isCDRPage && window.location.pathname !== "/case/cdr_case") {
      navigate("/case/cdr_case", { replace: true });
    }
  }, [isCDRPage, navigate]);

    const filteredVideos = Object.entries(videos).flatMap(([moduleKey, videoList]) =>
        videoList
            .filter((videoUrl) =>
                videoUrl.split("/").pop().toLowerCase().includes(searchQuery)
            )
            .map((videoUrl, idx) => {
                const fileName = videoUrl.split("/").pop();

                return (
                    <div
                        key={`${moduleKey}-${idx}`}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '8px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                            backgroundColor: '#fafafa',
                            overflow: 'hidden',
                        }}
                    >
                        <video
                            src={`${REACT_APP_SERVER_URL_FILE_VIEW}${videoUrl}`}
                            width="100%"
                            height="200"
                            controls
                            preload="metadata"
                            style={{ borderRadius: "4px" }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {fileName}
                            </Typography>
                        </Box>
                    </div>
                );
            })
    );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        {/* Sidebar */}
        <Box
          sx={{
            display: localStorage.getItem("user_id") === "1" ? "block" : "none",
            width: "253px",
            minWidth: "253px",
            overflow: "hidden",
          }}
        >
          <Paper sx={{ height: "100vh", borderRadius: "0", boxShadow: "none", borderRight: "1px solid #D0D5DD" }}>
            {/* Sidebar Header */}
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                justifyContent: "center",
                borderBottom: "1px solid #D0D5DD",
                height: "55.5px",
                padding: "3px",
              }}
            >
              <img
                srcSet={`${LogoText}?w=150&fit=crop&auto=format&dpr=2 4x`}
                src={`${LogoText}?w=150&fit=crop&auto=format`}
                alt=""
                style={{ width: "44px", height: "44px" }}
                loading="lazy"
              />

              <p className="cidLogoText">
                Case Management
                <br />
                System
              </p>

                <Navbar unreadNotificationCount={notificationCount} />

              <Divider sx={{ marginTop: 1 }} />
            </Box>

            
            {/* Sidebar Content (Navigation Links) */}

            <Box
              sx={{ position: "relative" }}
            >
              <List sx={{ padding: "4px", height: "100vh", overflow: "auto" }}>
                {/* 1st menu list */}
                <Box
                  py={0.5}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    paddingBottom: "150px",
                  }}
                >
                  {sidebarMenusObj &&
                    sidebarMenusObj.length > 0 &&
                    sidebarMenusObj.map((element, index) => {
                      // Check if this element is a main module
                      if (
                        element?.is_main_module &&
                        Array.isArray(JSON.parse(element?.sub_modules)) &&
                        JSON.parse(element?.sub_modules).length > 0
                      ) {
                        // Find matching submodules
                        const matchingSubModules = sidebarMenusObj.filter(
                          (subItem) =>
                            JSON.parse(element.sub_modules).includes(
                              subItem.module_id
                            )
                        );

                        var mainActiveClass = "";

                        matchingSubModules.map((subModule) => {
                          if (
                            subModule?.active_location?.includes(
                              location.pathname
                            )
                          ) {
                            mainActiveClass = "active";
                          }
                        });

                        return (
                          <>
                            {/* main module dropdown */}

                            <ListItem
                              sx={{ cursor: "pointer" }}
                              onClick={() => {
                                    handleDropdownToggle(element.name);
                                }}
                              className={`sidebarMenus ${mainActiveClass}`}
                            >
                              <ListItemIcon>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: element.icon_svg,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText primary={element?.ui_name} />
                              {openDropdowns[element.name] ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </ListItem>

                            {/* sub menu module */}

                            <Collapse
                              in={openDropdowns[element.name]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <List component="div" disablePadding>
                                {matchingSubModules.map(
                                  (subModule, subIndex) => (
                                    <ListItem
                                      key={subIndex}
                                      sx={{ pl: 4, cursor: "pointer" }}
                                      onClick={() =>{
                                          handleMenuClick() // Fetch userid based on hierarchy
                                          navigate(subModule.location)
                                        }
                                      }
                                      className={`subMenuSidebarMenus ${
                                        subModule?.active_location?.includes(
                                          location.pathname
                                        )
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      {/* <ListItemIcon>{icons["dashboardIcon"]}</ListItemIcon> */}
                                      <ListItemText
                                        primary={subModule?.ui_name}
                                      />
                                    </ListItem>
                                  )
                                )}
                              </List>
                            </Collapse>
                          </>
                        );
                      }

                      // individual sidebar menu
                      if (!element?.is_main_module && !element?.is_sub_module) {
                        return (
                          <ListItem
                            key={element.name}
                            sx={{ cursor: "pointer" }}
                            onClick={() => navigate(element.location)}
                            className={`sidebarMenus ${
                              element?.active_location?.includes(
                                location.pathname
                              )
                                ? "active"
                                : ""
                            }`}
                          >
                            <ListItemIcon>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: element.icon_svg,
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText primary={element?.ui_name} />
                          </ListItem>
                        );
                      }

                      return null;
                    })}
                </Box>
              </List>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                  gap: "8px",
                  padding: "12px 10px",
                  position: "absolute",
                  bottom: "70px",
                  width: "92%",
                  borderTop: "1px solid #D0D5DD",
                  background: "#FFFFFF",
                }}
              >
                <Box onClick={() => setOpenUserDesignationDropdown(true)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", cursor: 'pointer' }}>
                        <Box
                            sx={{
                                width: "32px",
                                height: "32px",
                                border: "1px solid #D0D5DD",
                                borderRadius: "50%",
                            }}
                        >
                            <img src={userImg} width="100%" height="100%" />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography
                                align="left"
                                sx={{
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    lineHeight: "18px",
                                    color: "#1D2939",
                                }}
                            >
                                {userName ? userName : "UserName"}<br />
                                <Typography
                                    noWrap
                                    sx={{
                                        fontWeight: 400,
                                        fontSize: "13px",
                                        lineHeight: "16px",
                                        color: userOverallDesignation.length > 0 ? "#0000EE" : "#98A2B3",
                                        maxWidth: "160px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        textDecoration: userOverallDesignation.length > 0 && 'underline'
                                    }}
                                >
                                    {designationName ? designationName : ""}
                                </Typography>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Typography
                  align="left"
                  sx={{
                    fontWeight: "400",
                    fontSize: "14px",
                    lineHeight: "18px",
                    color: "#98A2B3",
                  }}
                >
                  <svg
                    style={{ cursor: "pointer" }}
                    onClick={handleLogout}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 15C4 15.93 4 16.395 4.10222 16.7765C4.37962 17.8117 5.18827 18.6204 6.22354 18.8978C6.60504 19 7.07003 19 8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V5.8C19 4.11984 19 3.27976 18.673 2.63803C18.3854 2.07354 17.9265 1.6146 17.362 1.32698C16.7202 1 15.8802 1 14.2 1H8C7.07003 1 6.60504 1 6.22354 1.10222C5.18827 1.37962 4.37962 2.18827 4.10222 3.22354C4 3.60504 4 4.07003 4 5M10 6L14 10M14 10L10 14M14 10H1"
                      stroke="#1D2939"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box flex={4} sx={{ overflow: "hidden" }}>
            {localStorage.getItem("user_id") !== "1" && location.pathname !== "/dashboard" && (
            <Box
                component="header"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 60,
                    px: 2,
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    position: "relative",
                    top: 0
                }}
            >

                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                        src={`${LogoText}?w=150&fit=crop&auto=format`}
                        alt="CID Logo"
                        loading="lazy"
                        style={{ height: 55, marginRight: 10, cursor: "pointer" }}
                        onClick={() => navigate("/dashboard")}
                    />
                    <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333", lineHeight: 1.2 }}>
                            Case Management
                            <br />
                            System
                        </Typography>
                    </Box>
                    <HomeIcon
                        sx={{ cursor: "pointer", color: "#1D2939", fontSize: '30px', marginLeft: 2 }}
                        onClick={() => navigate("/dashboard", {state : {tabActiveKey: selectedActiveKey.current }})}
                    />
                    <Navbar unreadNotificationCount={notificationCount} />
                </Box>

                <Tabs
                    value={false}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        ".MuiTab-root": {
                            fontWeight: 600,
                            textTransform: "none",
                            color: "#1d2939",
                        },
                        ".Mui-selected": {
                            color: "#1976d2",
                        },
                    }}
                >
                    {tabLabels.map((tab) => {
                        const isSelected = selectedActiveKey.current === tab.key || tab.options?.some(
                            (opt) => (opt?.actionKey ?? opt?.key) === selectedActiveKey.current
                        );
                        return (
                            <Tab
                                key={tab.key}
                                label={tab.label}
                                value={tab.key} 
                                onClick={(e) => handleTabClick(e, tab)}
                                sx={{
                                    color: isSelected ? "#1976d2 !important" : "#1d2939",
                                    borderBottom: isSelected ? "2px solid #1976d2" : "none",
                                }}
                            />
                        );
                    })}
                </Tabs>

                <Menu
                    anchorEl={submenuAnchorEl}
                    open={Boolean(submenuAnchorEl)}
                    onClose={handleMenuClose}
                >
                    {submenuItems.map((option) => (
                        <MenuItem
                            key={option.key}
                            selected={selectedSubKey === option.key}
                            onClick={() => handleMenuItemClick(option)}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                    <Tooltip title="Click for help" onClick={handleVideoOpen}>
                        <HelpOutlineIcon sx={{fontSize: '26px', cursor: 'pointer'}} />
                    </Tooltip>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <Box onClick={() => setOpenUserDesignationDropdown(true)} sx={{ cursor: "pointer" }}>
                        <Typography sx={{ fontWeight: 500, fontSize: 16, color: "#1D2939" }}>
                            {userName || "UserName"}
                        </Typography>
                        <Typography
                            noWrap
                            sx={{
                                fontWeight: 400,
                                fontSize: 14,
                                color: userOverallDesignation.length > 0 ? "#0000EE" : "#98A2B3",
                                maxWidth: "160px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                textDecoration: userOverallDesignation.length > 0 ? "underline" : "none",
                            }}
                        >
                            {designationName || ""}
                        </Typography>
                    </Box>

                    <Box onClick={handleLogout} sx={{ cursor: "pointer" }}>
                        <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path
                            d="M4 15C4 15.93 4 16.395 4.10222 16.7765C4.37962 17.8117 5.18827 18.6204 6.22354 18.8978C6.60504 19 7.07003 19 8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V5.8C19 4.11984 19 3.27976 18.673 2.63803C18.3854 2.07354 17.9265 1.6146 17.362 1.32698C16.7202 1 15.8802 1 14.2 1H8C7.07003 1 6.60504 1 6.22354 1.10222C5.18827 1.37962 4.37962 2.18827 4.10222 3.22354C4 3.60504 4 4.07003 4 5M10 6L14 10M14 10L10 14M14 10H1"
                            stroke="#1D2939"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        </svg>
                    </Box>

                </Box>
                </Box>
            </Box>
            )}
            <Paper sx={{ height: "100vh", borderRadius: "0", boxShadow: "none", overflow: 'auto', bgcolor: location.pathname === "/dashboard" && localStorage.getItem("user_id") !== "1" && '#e5e7eb' }}>
                {/* Render nested route (e.g., Dashboard, Profile) */}
                {/* <Outlet /> */}
                <Box pb={3}>
                    {children}
                </Box>
            </Paper>
        </Box>
      </Stack>
      {loading && (
        <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
          <CircularProgress size={100} />
        </div>
      )}

    {openUserDesignationDropdown && userOverallDesignation?.length > 0 && (
        <Dialog
            open={openUserDesignationDropdown}
            keepMounted
            onClose={() => setOpenUserDesignationDropdown(false)}
            aria-describedby="alert-dialog-slide-description"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box>
                        <Typography
                            variant="h5"
                            style={{
                                fontWeight: "600",
                                fontSize: "24px",
                                color: "#1D2939",
                            }}
                        >
                            Choose Designation
                        </Typography>
                    </Box>
                    <Box
                        p={1}
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            background: "#EAECF0",
                            borderRadius: "50%",
                        }}
                    >
                        <svg
                            onClick={() => setOpenUserDesignationDropdown(false)}
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M14.6666 5.33447L5.33325 14.6678M5.33325 5.33447L14.6666 14.6678"
                                stroke="#667085"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                {userOverallDesignation.map((designation) => (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 2,
                            border: "1px solid #EAECF0",
                            borderRadius: "5px",
                            marginBottom: 2,
                            cursor: "pointer",
                        }}

                        className={`${designation?.designation_id == localStorage.getItem('designation_id') ? "activeDesignationRole" : ""}`}

                        onClick={ async () => {
                            if(designation?.division_id && designation?.designation_id){
                                localStorage.setItem("designation_id", designation?.designation_id);
                                localStorage.setItem("designation_name", designation?.designation?.designation_name);
                                localStorage.setItem("division_id", designation?.division_id);
                                localStorage.setItem("division_name", designation?.division?.division_name);
                                setOpenUserDesignationDropdown(false);

                                var selected_designation_id =localStorage.getItem("designation_id") || "0";
                                var selected_designation_name = localStorage.getItem("designation_name") || "";
                                var login_user_id = localStorage.getItem("user_id") || "0";
                                setLoading(true);
                                try {

                                    const serverURL = process.env.REACT_APP_SERVER_URL;
                                    const response = await fetch(`${serverURL}/auth/set_user_hierarchy`, {
                                        method: "POST",
                                        headers: {
                                        "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ user_id: login_user_id, designation_id: selected_designation_id , designation_name: selected_designation_name }),
                                    });

                                    setLoading(false);

                                    const data = await response.json();
                                    if (!response.ok) {
                                        throw new Error(data.message);
                                    }

                                    const responseData = data.data;
  
                                    if (data && data.success && !responseData.getDataBasesOnUsers) {
                                        localStorage.setItem("allowedUserIds",JSON.stringify(responseData.allowedUserIds));
                                        localStorage.setItem("allowedDepartmentIds",JSON.stringify(responseData.allowedDepartmentIds));
                                        localStorage.setItem("allowedDivisionIds",JSON.stringify(responseData.allowedDivisionIds));
                                        localStorage.setItem("getDataBasesOnUsers",JSON.stringify(responseData.getDataBasesOnUsers));
                                    }else{
                                        localStorage.setItem("allowedUserIds",JSON.stringify(responseData.allowedUserIds));
                                        localStorage.setItem("allowedDepartmentIds",JSON.stringify(responseData.allowedDepartmentIds));
                                        localStorage.setItem("allowedDivisionIds",JSON.stringify(responseData.allowedDivisionIds));
                                        localStorage.setItem("getDataBasesOnUsers",JSON.stringify(responseData.getDataBasesOnUsers));
                                    }

                                    // if(JSON.parse(localStorage.getItem("user_id")) === 1){
                                    //     navigate("/dashboard");
                                    // }else{
                                        if (location.pathname === "/dashboard") {
                                            navigate(0);
                                        } else {
                                            navigate("/dashboard");
                                        }
                                    // }
                        
                                } catch (err) {
                                    setLoading(false);
                                    console.log(err,"error");
                                }
                            }
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                style={{
                                    fontWeight: "600",
                                    fontSize: "18px",
                                    color: "#1D2939",
                                }}
                                className={`${designation?.designation_id == localStorage.getItem('designation_id') ? "activeDesignationRoleName" : ""}`}
                            >
                                {designation?.["designation"]?.designation_name}
                            </Typography>
                            <Typography
                                variant="h6"
                                style={{
                                    fontWeight: "400",
                                    fontSize: "14px",
                                    color: "#667085",
                                }}
                                className={`${designation?.designation_id == localStorage.getItem('designation_id') ? "activeDesignationRoleDesc" : ""}`}
                            >
                                {designation?.["designation"]?.description}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </DialogContent>
        </Dialog>
    )}

    
    <Dialog
        open={videoOpen}
        onClose={handleVideoClose}
        fullWidth
        maxWidth="2xl"
        scroll="paper"
    >
        <DialogTitle sx={{ m: 0, p: 2 }}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                Videos
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                        sx={{ width: 300 }}
                    />
                    <IconButton
                        aria-label="close"
                        onClick={handleVideoClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>
        </DialogTitle>

        <DialogContent dividers>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr 1fr',
                    },
                    mb: 3,
                    gap: 2,
                }}
            >
                {filteredVideos.length > 0 ? (
                    filteredVideos
                ) : (
                    <Typography variant="body1" sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 4 }}>
                        No videos found.
                    </Typography>
                )}
            </Box>
        </DialogContent>
    </Dialog>

    </Box>
  );
};

export default Layout;
