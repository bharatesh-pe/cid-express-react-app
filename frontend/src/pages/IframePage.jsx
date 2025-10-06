import React, { useEffect, useState } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";

import api from "../services/api";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CircularProgress } from "@mui/material";

function IframePage() {
    const [embedConfig, setEmbedConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const callPowerBiUrl = async ()=> {
            setLoading(true);
            try {
                const response = await api.post('/powerBi/getEmbedToken')

                setLoading(false);

                if (response && response.success && response.data) {

                    const { data } = response;

                    setEmbedConfig({
                        type: "report",
                        id: data.reportId,
                        embedUrl: data.embedUrl,
                        accessToken: data.embedToken,
                        tokenType: models.TokenType.Embed,
                        settings: {
                            panes: {
                                filters: {
                                    expanded: false,
                                    visible: true,
                                },
                            },
                        },
                    });

                    return true;

                }else{
                    toast.error(response?.['message'] ? response?.['message'] : 'Please try again!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-error",
                    });
                    return;
                }
                
            } catch (error) {
                setLoading(false);
                if (error && error.response && error.response.data) {
                    toast.error(error.response.data['message'] ? error.response.data['message'] : 'Please try again!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        className: "toast-error",
                    });
                    return;
                }
            }
        }

        callPowerBiUrl();

    }, []);

    return (
        <div className="PowerBiApp">
            <header className="PowerBiAppHeader">
                {embedConfig && Object.keys(embedConfig).length > 0 && (
                    <PowerBIEmbed
                        embedConfig={embedConfig}
                        eventHandlers={
                            new Map([
                                [
                                    "loaded",
                                    function () {
                                        console.log("Report loaded");
                                    },
                                ],
                                [
                                    "rendered",
                                    function () {
                                        console.log("Report rendered");
                                    },
                                ],
                                [
                                    "error",
                                    function (event) {
                                        console.log(event.detail);
                                    },
                                ],
                            ])
                        }
                        cssClassName={"EmbedContainer"}
                        getEmbeddedComponent={(embeddedReport) => {
                            window.report = embeddedReport;
                        }}
                    />
                )}
            </header>
            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}
        </div>
    );
}

export default IframePage;

