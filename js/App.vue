<template>
<div id="app" class="cui app">
    <About v-if="showAbout" @onClose="closeAbout" />
    <Share v-if="showShare" @onClose="closeShare" :files="selectedFiles" />
    <Alert v-if="showSplash" @onClose="closeSplash" title="Welcome!">
        Please keep in mind that this is a test release! Some bugs are expected and many features are still missing. We have great plans for DroneDB and we want you to have access to the earliest releases (even if unfinished).<br/><br/>
        If you find a problem, report it from the Help menu. Thank you! <span style="color: red;">♥</span><br/><br/>
        p.s. we also welcome feedback of any kind. Get in touch: pt@uav4geo.com<br/><br/>
    </Alert>

    <Panel split="vertical" class="container main" amount="23.6%">
        <div class="sidebar">
            <FileBrowser :rootNodes="rootNodes" 
                @selectionChanged="handleFileSelectionChanged"
                @currentUriChanged="handleCurrentUriChanged" 
                @openProperties="handleFileBrowserOpenProperties"
                @error="handleError" />
        </div>
        <TabSwitcher :tabs="mainTabs"
                position="top"
                buttonWidth="auto"
                :hideSingle="true"
                ref="mainTabSwitcher" >
            <template v-slot:map>
                <Map :files="fileBrowserFiles" @scrollTo="handleScrollTo" />
            </template>
            <template v-slot:explorer>
                <Explorer ref="explorer"
                    :files="fileBrowserFiles"
                    :tools="explorerTools"
                    :currentPath="currentPath"
                    @openProperties="handleExplorerOpenProperties" />
            </template>
        </TabSwitcher>
    </Panel>

    <DeleteDialog v-if="deleteDialogOpen" @onClose="handleDeleteClose" :files="selectedFiles"></DeleteDialog>
    <RenameDialog v-if="renameDialogOpen" @onClose="handleRenameClose" :path="renamePath"></RenameDialog>
    <NewFolderDialog v-if="createFolderDialogOpen" @onClose="handleNewFolderClose"></NewFolderDialog>

    <Alert :title="errorMessageTitle" v-if="errorDialogOpen" @onClose="handleErrorDialogClose">
        {{errorMessage}}
    </Alert>
    <Properties v-if="showProperties" :files="contextMenuFiles" @onClose="handleCloseProperties" />
    <Loader v-if="isBusy"></Loader>
</div>
</template>

<script>
import NewFolderDialog from 'commonui/components/NewFolderDialog.vue';
import DeleteDialog from 'commonui/components/DeleteDialog.vue';
import RenameDialog from 'commonui/components/RenameDialog.vue';
import Toolbar from 'commonui/components/Toolbar.vue';
import Map from 'commonui/components/Map.vue';
import Explorer from 'commonui/components/Explorer.vue';
import FileBrowser from 'commonui/components/FileBrowser.vue';
import TabSwitcher from 'commonui/components/TabSwitcher.vue';
import Properties from 'commonui/components/Properties.vue';
import About from './components/About.vue';
import Share from './components/Share.vue';
import Alert from 'commonui/components/Alert.vue';
import Panel from 'commonui/components/Panel.vue';
import Loader from 'commonui/components/Loader.vue';

import icons from 'commonui/classes/icons';

import mfs from 'mfs';
import {
    setMenuItem
} from 'commonui/dynamic/menu';

import { clone } from 'commonui/classes/utils';

import ddb from 'ddb';
const { pathutils, utils } = ddb;

export default {
    components: {
        NewFolderDialog,
        DeleteDialog,
        RenameDialog,
        Toolbar,
        Map,
        FileBrowser,
        Explorer,
        Properties,
        TabSwitcher,
        About,
        Share,
        Alert,
        Panel,
        Loader
    },
    data: function () {
        return {
            fileBrowserFiles: [],
            error: "",
            mainTabs: [{
                label: 'Map',
                icon: 'map',
                key: 'map'
            },{
            //     label: '3D',
            //     icon: 'cube',
            //     key: 'potree'
            // },{
                label: 'Files',
                icon: 'folder open',
                key: 'explorer'
            }],

            showProperties: false,
            explorerTools: [],

            showAbout: false,
            showLicense: false,
            showShare: false,

            showSplash: localStorage.getItem("showed_splash") !== "1",

            uploadDialogOpen: false,
            deleteDialogOpen: false,
            renameDialogOpen: false,
            createFolderDialogOpen: false,
            renamePath: null,

            isBusy: false,
            currentPath: null,

            errorDialogOpen: false,
            errorMessage: null,
            errorMessageTitle: null,
        }
    },
    computed: {
        selectedFiles: function () {
            return this.fileBrowserFiles.filter(f => f.selected);
        },
        contextMenuFiles: function(){
            if (this.selectedUsingFileBrowserList){
                return this.fileBrowserFiles;
            }else{
                return this.selectedFiles;
            }
        }
    },
    props: {},
    mounted: function () {
        window.addEventListener('btnAbout_Click', this.openAbout);
        window.addEventListener('btnEnterLicense_Click', this.openLicense);
        window.addEventListener('btnShare_Click', this.openShare);
    },
    destroyed: function () {
        window.removeEventListener('btnAbout_Click', this.openAbout);
        window.removeEventListener('btnEnterLicense_Click', this.openLicense);
    },
    methods: {
        handleFileSelectionChanged: function (fileBrowserFiles) {
            this.fileBrowserFiles.forEach(f => f.selected = false);
            this.fileBrowserFiles = fileBrowserFiles;
        },
        handleCurrentUriChanged: function(currentUri){
            this.currentPath = currentUri != null ? utils.pathFromUri(currentUri) : null;
        },

        handleExplorerOpenProperties: function () {
            this.showProperties = true;
            this.selectedUsingFileBrowserList = false;
        },
        handleFileBrowserOpenProperties: function () {
            this.showProperties = true;
            this.selectedUsingFileBrowserList = true;
        },
        handleCloseProperties: function () {
            this.showProperties = false;
        },
        handleNewFolderClose: async function(id, newFolderPath) {

            if (id == "createFolder") {
                if (newFolderPath == null || newFolderPath.length == 0) return;
                await this.createFolder(newFolderPath);
            }

            this.createFolderDialogOpen = false;
        },
        createFolder: async function(newPath) {
            
            this.$log.info("ViewDataset.createFolder(newPath)", newPath);

            this.isBusy = true;
            
            newPath = this.currentPath ? this.currentPath + "/" + newPath : newPath;

            try {
                await mfs.createFolder(newPath);

                var entry = (await ddb.info(newPath))[0];

                var folderItem = {
                    icon: icons.getForType(entry.type),
                    label: pathutils.basename(entry.path),
                    path: entry.path,
                    selected: false,
                    entry,
                    empty: true,
                    isExpandable: true
                };

                this.fileBrowserFiles.push(folderItem);

                this.sortFiles();

                // Tell filebrowser to add items
                this.$root.$emit('addItems', [folderItem]);

            } catch(e) {
                console.log(e);
                this.showError(e, "Create folder");
            }

            this.isBusy = false;
        },

        sortFiles: function() {
            this.$log.info("ViewDataset.sortFiles");
            this.fileBrowserFiles = this.fileBrowserFiles.sort((n1, n2) => {
                    var a = n1.entry;
                    var b = n2.entry;

                    // Folders first
                    let aDir = ddb.entry.isDirectory(a);
                    let bDir = ddb.entry.isDirectory(b);

                    if (aDir && !bDir) return -1;
                    else if (!aDir && bDir) return 1;
                    else {
                        // then filename ascending
                        return pathutils.basename(a.path.toLowerCase()) > pathutils.basename(b.path.toLowerCase()) ? 1 : -1
                    }
                });
        },

        handleDeleteClose: async function(id) {
            if (id == "remove") {
                await this.deleteSelectedFiles();
            }

            this.deleteDialogOpen = false;
        },
        deleteSelectedFiles: async function() {

            this.$log.info("ViewDataset.deleteSelectedFiles");

            this.isBusy = true;

            try {
                var deleted = [];

                for(var file of this.selectedFiles) {
                    await mfs.remove(utils.pathFromUri(file.entry.path));
                    deleted.push(file.entry.path);
                }
                
                this.fileBrowserFiles = this.fileBrowserFiles.filter(item => !deleted.includes(item.entry.path));

                this.$root.$emit('deleteEntries', deleted);
            } catch(e) {
                this.showError(e, "Delete");
            }

            this.isBusy = false;
        },

        openAbout: function () {
            this.showAbout = true;
        },
        closeAbout: function () {
            this.showAbout = false;
        },
        openLicense: function () {
            this.showLicense = true;
        },
        closeLicense: function () {
            this.showLicense = false;
        },
        enterLicense: function () {
            this.closeAbout();
            this.openLicense();
        },

        openShare: function () {
            this.selectedUsingFileBrowserList = false;
            this.showShare = true;
        },
        closeShare: function () {
            this.showShare = false;
        },

        handleScrollTo: function(file){
            this.$refs.explorer.scrollTo(file);
        },

        rootNodes: async function () {
            const nodes = [];
            const drives = await mfs.getDriveList();

            for (let i = 0; i < drives.length; i++) {
                const d = drives[i];
                nodes.push({
                    icon: "hdd outline",
                    label: d.replace(/^([A-Z]:)\/$/, "$1\\"),
                    path: `file://${d}`
                });
            }

            const homeDir = mfs.getHomeDirectory();
            nodes.push({
                icon: "home",
                label: "Home",
                path: `file://${homeDir}`
            });

            return nodes;
        },

        closeSplash: function(buttonId){
            localStorage.setItem("showed_splash", "1");
            this.showSplash = false;
        },

        handleError: function(e){
            this.showError(e, "Error");
        },

        showError: function(text, title) {
            this.errorMessage = text;
            this.errorMessageTitle = (typeof title === 'undefined' || title == null) ? "Error" : title;
            this.errorDialogOpen = true;
        },

        handleRenameClose: async function(id, newPath) {
            
            if (id == "rename") {
                if (newPath == null || newPath.length == 0) return;
                await this.renameSelectedFile(newPath);
            }

            this.renameDialogOpen = false;
        },

        renameSelectedFile: async function(newPath) {

            this.$log.info("ViewDataset.renameSelectedFile(newPath)", newPath);

            this.isBusy = true;

            if (this.selectedFiles.length == 0) return;

            try {
                var item = this.selectedFiles[0];
                var oldPath = item.entry.path;

                var localOldPath = utils.pathFromUri(item.entry.path);
                var localNewPath = utils.pathFromUri(newPath);

                await mfs.rename(localOldPath, localNewPath);

                // Let's remove both the new file path and the old one because it could be a replace
                this.fileBrowserFiles = this.fileBrowserFiles.filter(item => item.entry.path != oldPath && item.entry.path != newPath);

                var newItem = clone(item);
                newItem.path = newPath,
                newItem.label = pathutils.basename(newPath);
                newItem.entry.path = newPath;

                // Let's add it to our explorer (we are in the same folder)
                if (utils.pathFromUri(pathutils.getParentFolder(newPath)) == this.currentPath) 
                    this.fileBrowserFiles.push(newItem);

                // Tell filebrowser to remove the file in the old location and add to the new location
                this.$root.$emit('deleteEntries', [oldPath]);
                this.$root.$emit('addItems', [newItem]);

                this.sortFiles();

            } catch(e) {
                this.showError(e, "Rename file");
            }

            this.isBusy = false;
        },

        handleErrorDialogClose: function () {
            this.errorDialogOpen = false;
        },
    },

    watch: {
        fileBrowserFiles: {
            deep: true,
            handler: function (newVal, oldVal) {
                const disableShare = newVal.filter(f => f.selected && !f.root).length === 0;

                setMenuItem('btnShare', 'enabled', !disableShare);
            }
        },


        selectedFiles: {
            handler: function(){
                this.explorerTools = [{
                    id: 'newfolder',
                    title: "Create folder",
                    icon: "folder",
                    onClick: () => {
                        this.createFolderDialogOpen = true;
                    }
                }];

                if (this.selectedFiles.length > 0){
                    this.explorerTools.push({
                        id: 'share',
                        title: "Share Selected Files and Folders",
                        icon: "share square",
                        onClick: this.openShare
                    });
                }

                if (this.selectedFiles.length == 1) {
                    this.explorerTools.push({
                        id: 'rename',
                        title: "Rename",
                        icon: "edit",
                        onClick: () => {
                            this.renamePath = this.selectedFiles[0].entry.path;
                            this.renameDialogOpen = true;
                        }
                    });
                }

                if (this.selectedFiles.length > 0) {
                    this.explorerTools.push({
                        id: 'remove',
                        title: "Remove",
                        icon: "trash alternate",
                        onClick: () => {
                            this.deleteDialogOpen = true;
                        }
                    });
                }
            }
        }
    }
}
</script>

<style scoped>
.cui.app{
    border-top: 1px solid #bbbbbb;
}
</style>
