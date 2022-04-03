import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { TreeView } from '@mui/lab';
import { styled, Toolbar } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import React, { ReactElement, SyntheticEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { deleteNoteAsync, selectNotesTree, TreeNode, TreeUtil } from '../reducer/noteSlice';
import { User } from '../reducer/userSlice';
import { getTitleFromFilename, isFilePath, splitPath } from '../util/util';
import StyledTreeItem from './StyledTreeItem';

interface Props {
  user: User | null
}

export const DRAWER_WIDTH = 240;
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  () => ({
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      position: 'relative',
      whiteSpace: 'nowrap',
      width: DRAWER_WIDTH,
    },
  }),
)

const AppDrawer: React.FC<Props> = (): ReactElement => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const getAllSubpath = (path: string): string[] => {
    const subpath = splitPath(path).map((s, i) => path.split('/').slice(0, i + 1).join('/'));
    subpath.push('/'); // add root path
    return subpath;
  }
  const path = decodeURIComponent(searchParams.get('path') || "%2F");
  const [expanded, setExpanded] = React.useState<string[]>(getAllSubpath(path));
  const tree = useAppSelector(selectNotesTree);

  useEffect(() => {
    setExpanded(getAllSubpath(path));
  }, [tree, path])

  const handleNodeSelect = (e: React.SyntheticEvent, path: string) => {
    isFilePath(path) ? navigate("/view?path=" + encodeURIComponent(path))
      : navigate("/?path=" + encodeURIComponent(path));
  }

  const handleCreate = (e: SyntheticEvent, dirPath: string) => {
    e.stopPropagation();
    navigate(`/new?path=${dirPath}`);
  }

  const handleEdit = (e: SyntheticEvent, filepath: string) => {
    e.stopPropagation();
    navigate("/edit?path=" + encodeURIComponent(filepath));
  }

  const handleDelete = (e: SyntheticEvent, filepath: string) => {
    e.stopPropagation();
    const n = TreeUtil.searchNode(tree, filepath)
    n && dispatch(deleteNoteAsync(n));
  }

  const renderTree = (t: TreeNode) => {
    return (
      <StyledTreeItem key={t.path} nodeId={t.path || "/"} label={getTitleFromFilename(t.name)} isDir={t.is_dir}
        endIcon={<ArticleOutlinedIcon />} expandIcon={<FolderOutlinedIcon />} collapseIcon={<FolderOpenOutlinedIcon />}
        handleEdit={handleEdit} handleDelete={handleDelete} handleCreate={handleCreate}>
        {Array.isArray(t.children) ? t.children.map((c) => renderTree(c)) : null}
      </StyledTreeItem>
    )
  }
  const treeJSX = renderTree(tree);

  return (
    <Drawer variant="permanent">
      <Toolbar />
      <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded} selected={path} onNodeSelect={handleNodeSelect}
        onNodeToggle={(e, ids) => setExpanded(ids)} sx={{ flexGrow: 1, minWidth: "max-content", width: "100%" }}>
        {treeJSX}
      </TreeView>
    </Drawer>
  )
}

export default AppDrawer;
