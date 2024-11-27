import styled, { css } from 'styled-components';

interface IButtonProps {
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export const Button = styled.button<IButtonProps>`
  border: 0;
  cursor: pointer;
  font-family: 'Work Sans', sans-serif;
  height: 48px;
  outline: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  line-height: 22px;
  white-space: nowrap;
  border-radius: 12px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  border: 2px solid transparent;
  background-color: #6259ff;
  color: #ffffff;

  &:enabled {
    &:hover {
      background-color: #564ee1;
      box-shadow:
        0px 2px 4px -1px #8b8ced52,
        0px 2px 2px 0px #8b8ced52;
    }

    &:active {
      border: 2px solid #363199;
      background-color: #4b45c1;
    }
  }

  &:disabled {
    background-color: #a8abb5;
    cursor: not-allowed;
  }

  ${({ variant }) => {
    if (variant === 'secondary') {
      return css`
        &:disabled {
          background-color: #c3c6d133;
          color: #a8abb5;
        }
        &:enabled {
          background: rgba(98, 89, 255, 0.1);
          color: #6259ff;

          &:hover {
            box-shadow:
              0px 2px 4px -1px #e1dfff52,
              0px 2px 2px 0px #e1dfff52;
            background-color: #dcdafb;
          }

          &:active {
            border: 2px solid #6259ff;
            background-color: #d1cefb;
          }
        }
      `;
    }

    if (variant === 'tertiary') {
      return css`
        &:disabled {
          background-color: transparent;
          color: #a8abb5;
          border: 1px solid #a8abb5;
        }
        &:enabled {
          background-color: transparent;
          color: #6259ff;
          border: 1px solid #6259ff;

          &:hover {
            color: #6259ff;
            box-shadow:
              0px 2px 4px -1px #e1dfff52,
              0px 2px 2px 0px #e1dfff52;
            border-color: #6259ff;
            background-color: rgba(98, 89, 255, 0.05);
          }

          &:active {
            border: 2px solid #6259ff;
            background-color: #6259ff1c;
          }
        }
      `;
    }
  }}

  ${(props) =>
    props.hidden &&
    css`
      display: none;
    `}

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

    ${(props) =>
    props.role === 'inline' &&
    css`
      padding: 0 6px;
      height: auto;
    `}
`;
