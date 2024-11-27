import styled, { css } from 'styled-components';
import { DialogContent } from '@mui/material';

const InputFieldStyles = css`
  padding: 9px 12px;
  border: 2px solid black};
  border-radius: 8px;

  &.Mui-focused {
    border-color: black};

    .MuiIconButton-root svg {
      color: black.neutral.main};
    }

    & > .MuiSvgIcon-root {
      color: black};
    }
  }

  &::after, &::before {
    display: none;
  }

  .MuiSvgIcon-root {
    color: black};
  }

  .MuiIconButton-root {
    position: absolute;
    top: 3px;
    right: 40px;
    padding: 8px;

    &:hover svg {
      color: black.neutral.main};
    }

    svg {
      width: 19px;
      height: 19px;
      color: black};
    }
  }

  input {
    font-size: 16px;
    font-family: "Poppins", sans-serif;
    padding: 0;
    margin-bottom: 2px;
    padding-right: 32px;
    overflow: hidden;
    text-overflow: ellipsis;

    &::before, &::after {
      display: none;
    }
  }
`;

export const StyledDialogTitle = styled.div`
  margin-bottom: 32px;

  & > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: black;
    }

    .MuiIconButton-root {
      pointer-events: all;
      color: #252e47;
      margin: -6px -12px -6px 0;

      span {
        pointer-events: none;
      }
    }
  }
`;

export const ContainerListPreferredTokens = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: 8px;
  flex-wrap: wrap;
  position: relative;
  justify-content: center;
  margin-bottom: 32px;

  .MuiChip-root.MuiChip-root {
    height: 40px;
    display: flex;
    justify-content: space-between;
    padding: 8px 8px 8px 4px;
    border-radius: 12px;

    &.MuiChip-outlinedPrimary { // selected token
      background: black};
      color: white;

      svg {
        background: white;
        border-radius: 50%;
      }
    }

    &:hover {
      &:not(.MuiChip-outlinedPrimary) {
        background: #F5F3FF;
        border-color: black};
      }

      svg.MuiChip-deleteIcon {
        display: block;
      }
    }

    .MuiAvatar-root {
      margin: 0;
      background: white;
      pointer-events: none;

      &.MuiAvatar-colorDefault { // tokens with no image
        background: black};
        font-size: 12px;
        font-weight: 100;

        svg.MuiAvatar-fallback {
          background: none;
  
          path {
            fill: transparent;
          }
        } 
      }

      img.MuiAvatar-img {
        width: 20px;
        height: 20px;
      }
    }

    span {
      font-size: 15px;
      font-weight: 600;
      padding: 0;
      margin-left: 8px;
      pointer-events: none;
    }    
  }

  svg.MuiChip-deleteIcon.MuiChip-deleteIcon {
    display: none;
    position: absolute;
    top: -10px;
    right: -10px;
    margin: 0;
    color: black};
    box-shadow: inset 0 0 0 2px #fdfcff;
    border-radius: 50%;
    background: #fdfcff;
    pointer-events: all;
  }
`;

export const ContainerSearchInput = styled.div`
  margin-bottom: 32px;

  .MuiInputBase-root {
    ${InputFieldStyles}
  }
`;

export const DialogWrapper = styled.div`
  position: relative;
  width: 425px;
  background: #fafafa;
  padding: 32px;
`;

export const StyledDialogContent = styled(DialogContent)<{
  $isAddCustomToken: boolean;
  $noTokensFound: boolean;
}>`
  padding: 0 1px;

  &::before, &::after {
    content: "";
    position: absolute;
    left: 0;
    height: 94px;
    width: 100%;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    bottom: 300px;
    background: linear-gradient(0, rgba(255, 255, 255, 0) 0%, #fafafa 65.62%);
  }

  &.hidden-before::before {
    display: none;
  }

  &::after {
    bottom: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fafafa 65.62%);
  }

  &.hidden-after::after {
    display: none;
  }

  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-thumb {
    background: #9d97fb;
    border-radius: 10px;
    min-height: 12px;
    border: 4px solid transparent;
    background-clip: padding-box; // <== make the border work
  }

  ::-webkit-scrollbar-thumb:hover {
    border: 0;
    background: black};
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ul {
    padding: 0;
    height: ${(props) =>
      props.$isAddCustomToken
        ? '81px'
        : props.$noTokensFound
          ? '246px'
          : '330px'};
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px; 

    > span {
      color: black.neutral.main};
    }

    .MuiListItem-root {
      height: 40px;
      display: flex;
      align-items: center;
      border-radius: 12px;
      padding: 8px 12px;
      position: relative;

      &:hover {
        background: #F5F3FF;
        z-index: 3;

        .pin {
          display: block;
        }
      }

      &.Mui-selected {
        background: black};

        &:hover {
          background: black};
        }

        &, & * {
          color: white;
          fill: white;
        }

        .pin:hover, a:hover {
          svg path {
            fill: black};
          }
        }
      }

      .MuiListItemIcon-root {
        min-width: unset;
        margin-right: 8px;
        background: white;
        border-radius: 50%;

        .MuiAvatar-root {
          pointer-events: none;
          width: 24px;
          height: 24px;

          &.MuiAvatar-colorDefault {
            font-size: 12px;
            color: #616161;
            font-weight: 100;
            background: black};
          }

          svg.MuiAvatar-fallback path {
            fill: transparent;
          }
        }
      }

      .pin {
        display: none;
        position: absolute;
        top: 5px;
        right: 40px;
        padding: 4px 8px 4px 8px;
        border-radius: 50%;

        svg {
          pointer-events: none;
          width: 14px;
          height: 13px;
        }

        &:hover {
          background: white;
        }
      }

      .MuiListItemText-root {
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;

        .token {
          width: calc(100% - 67px); // 67px to account for the pin
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;

          span.balance {
            font-size: 13px;
          }
        }

        a {
          border-radius: 50%;
          padding: 4px 9px 3px 9px;
          margin-right: -4px;
          
          &:hover {
            background: white;
          }

          svg {
            pointer-events: none;
            width: 14px;
            height: 13px;
          }
        }
      }
    }
  }
`;

export const AddTokenWrapper = styled.div<{
  isAddCustomToken: boolean;
}>`
  padding: 32px;
  text-align: center;
  font-size: 16px;
  border-top: 1px solid black};
  cursor: pointer;
  color: black};
  position: relative;
  height: ${(props) => (props.isAddCustomToken ? 'unset' : '84px')};

  & > button {
    width: 100%;
  }

  & > p {
    margin: 0;

    ${(props) =>
      props.isAddCustomToken
        ? css`
            text-align: left; // now, the add token text becomes a subtitle
            font-size: 18px;
            font-weight: 700;
            color: #444c5e;
          `
        : css`
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 32px 0;
          `}
  }

  .MuiInputBase-root {
    ${InputFieldStyles}
    margin: 32px 0;
    padding: 10px 12px 11px 12px;

    .MuiIconButton-root {
      right: 9px;
    }
  }
`;
